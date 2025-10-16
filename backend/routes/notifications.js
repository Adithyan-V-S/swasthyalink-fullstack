const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// In-memory storage for notifications (fallback when Firestore is not available)
let notificationsStore = [];
let notificationIdCounter = 1;

let db;
try {
  db = admin.firestore();
  console.log('✅ Firestore initialized successfully');
} catch (error) {
  console.log('⚠️ Firestore not available, using in-memory storage');
  db = null;
}

// Test endpoint to check Firebase connection
router.get('/test', (req, res) => {
  try {
    if (db) {
      console.log('Testing Firebase connection...');
      // Test Firestore connection
      db.collection('test').doc('test').get()
        .then(testDoc => {
          console.log('Firebase connection test successful');
          res.json({
            success: true,
            message: 'Firebase connection working',
            exists: testDoc.exists,
            storage: 'firestore'
          });
        })
        .catch(error => {
          console.error('Firebase connection test failed:', error);
          res.status(500).json({
            success: false,
            error: 'Firebase connection failed',
            details: error.message,
            storage: 'memory'
          });
        });
    } else {
      res.json({
        success: true,
        message: 'Using in-memory storage (Firestore not available)',
        storage: 'memory'
      });
    }
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Firebase connection failed',
      details: error.message,
      storage: 'memory'
    });
  }
});

// Get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    console.log('Fetching notifications for user:', userId);

    if (db) {
      // Use Firestore
      const notificationsRef = db.collection('notifications');
      const query = notificationsRef
        .where('recipientId', '==', userId)
        .limit(parseInt(limit));

      const snapshot = await query.get();
      const notifications = [];

      console.log('Found', snapshot.size, 'notifications');

      snapshot.forEach(doc => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
          createdAt: data.createdAt?.toDate?.() || data.createdAt
        });
      });

      // Sort by timestamp in JavaScript since Firestore ordering might not work
      notifications.sort((a, b) => {
        const aTime = a.timestamp || a.createdAt || new Date(0);
        const bTime = b.timestamp || b.createdAt || new Date(0);
        return new Date(bTime) - new Date(aTime);
      });

      res.json({
        success: true,
        notifications,
        total: notifications.length,
        storage: 'firestore'
      });
    } else {
      // Use in-memory storage
      const userNotifications = notificationsStore
        .filter(n => n.recipientId === userId)
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({
        success: true,
        notifications: userNotifications,
        total: notificationsStore.filter(n => n.recipientId === userId).length,
        storage: 'memory'
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
      details: error.message
    });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (db) {
      // Use Firestore
      await db.collection('notifications').doc(notificationId).update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Use in-memory storage
      const notificationIndex = notificationsStore.findIndex(n => n.id == notificationId);
      if (notificationIndex !== -1) {
        notificationsStore[notificationIndex].read = true;
        notificationsStore[notificationIndex].readAt = new Date().toISOString();
      } else {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    if (db) {
      // Use Firestore
      const notificationsRef = db.collection('notifications');
      const query = notificationsRef
        .where('recipientId', '==', userId)
        .where('read', '==', false);

      const snapshot = await query.get();
      const batch = db.batch();

      snapshot.forEach(doc => {
        batch.update(doc.ref, {
          read: true,
          readAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });

      await batch.commit();

      res.json({
        success: true,
        message: `Marked ${snapshot.size} notifications as read`
      });
    } else {
      // Use in-memory storage
      let count = 0;
      notificationsStore.forEach(notification => {
        if (notification.recipientId === userId && !notification.read) {
          notification.read = true;
          notification.readAt = new Date().toISOString();
          count++;
        }
      });

      res.json({
        success: true,
        message: `Marked ${count} notifications as read`
      });
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (db) {
      // Use Firestore
      await db.collection('notifications').doc(notificationId).delete();
    } else {
      // Use in-memory storage
      const notificationIndex = notificationsStore.findIndex(n => n.id == notificationId);
      if (notificationIndex !== -1) {
        notificationsStore.splice(notificationIndex, 1);
      } else {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
});

// Create notification (for testing purposes)
router.post('/', async (req, res) => {
  try {
    const {
      recipientId,
      type,
      title,
      message,
      data = {},
      priority = 'normal'
    } = req.body;

    if (!recipientId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientId, type, title, message'
      });
    }

    if (db) {
      // Use Firestore
      const notification = {
        recipientId,
        type,
        title,
        message,
        data,
        priority,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('notifications').add(notification);

      res.json({
        success: true,
        notificationId: docRef.id,
        message: 'Notification created successfully',
        storage: 'firestore'
      });
    } else {
      // Use in-memory storage
      const notification = {
        id: notificationIdCounter++,
        recipientId,
        type,
        title,
        message,
        data,
        priority,
        read: false,
        createdAt: new Date().toISOString()
      };

      notificationsStore.push(notification);

      res.json({
        success: true,
        notificationId: notification.id,
        message: 'Notification created successfully',
        storage: 'memory'
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
});

// Get notification statistics for a user
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    if (db) {
      // Use Firestore
      const notificationsRef = db.collection('notifications');

      // Get total notifications
      const totalQuery = notificationsRef.where('recipientId', '==', userId);
      const totalSnapshot = await totalQuery.get();

      // Get unread notifications
      const unreadQuery = notificationsRef
        .where('recipientId', '==', userId)
        .where('read', '==', false);
      const unreadSnapshot = await unreadQuery.get();

      // Get notifications by type
      const typeStats = {};
      unreadSnapshot.forEach(doc => {
        const type = doc.data().type;
        typeStats[type] = (typeStats[type] || 0) + 1;
      });

      res.json({
        success: true,
        stats: {
          total: totalSnapshot.size,
          unread: unreadSnapshot.size,
          read: totalSnapshot.size - unreadSnapshot.size,
          byType: typeStats
        },
        storage: 'firestore'
      });
    } else {
      // Use in-memory storage
      const userNotifications = notificationsStore.filter(n => n.recipientId === userId);
      const unreadNotifications = userNotifications.filter(n => !n.read);

      // Get notifications by type
      const typeStats = {};
      unreadNotifications.forEach(notification => {
        const type = notification.type;
        typeStats[type] = (typeStats[type] || 0) + 1;
      });

      res.json({
        success: true,
        stats: {
          total: userNotifications.length,
          unread: unreadNotifications.length,
          read: userNotifications.length - unreadNotifications.length,
          byType: typeStats
        },
        storage: 'memory'
      });
    }
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics'
    });
  }
});

module.exports = router;