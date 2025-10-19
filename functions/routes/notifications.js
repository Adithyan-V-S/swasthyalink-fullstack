/**
 * Notification Routes for SwasthyaLink Firebase Functions
 * Handles notification management
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Get Firestore instance
const db = admin.firestore();

// Test endpoint to check Firebase connection
router.get('/test', (req, res) => {
  try {
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
          storage: 'firestore'
        });
      });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      details: error.message
    });
  }
});

// Create notification
router.post('/create', async (req, res) => {
  try {
    const { userId, title, message, type, data, priority = 'normal' } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'userId, title, and message are required'
      });
    }

    const notification = {
      userId,
      title,
      message,
      type: type || 'info',
      data: data || {},
      priority,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('notifications').add(notification);
    
    res.json({
      success: true,
      notificationId: docRef.id,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification',
      details: error.message
    });
  }
});

// Get notifications for user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    let query = db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (unreadOnly === 'true') {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();
    const notifications = [];

    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      notifications,
      count: notifications.length
    });
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
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.collection('notifications').doc(notificationId).update({
      read: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
      details: error.message
    });
  }
});

// Mark all notifications as read for user
router.put('/user/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    const batch = db.batch();
    const snapshot = await db.collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `${snapshot.size} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
      details: error.message
    });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;

    await db.collection('notifications').doc(notificationId).delete();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
      details: error.message
    });
  }
});

// Get notification statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [totalSnapshot, unreadSnapshot] = await Promise.all([
      db.collection('notifications').where('userId', '==', userId).get(),
      db.collection('notifications').where('userId', '==', userId).where('read', '==', false).get()
    ]);

    res.json({
      success: true,
      stats: {
        total: totalSnapshot.size,
        unread: unreadSnapshot.size,
        read: totalSnapshot.size - unreadSnapshot.size
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notification statistics',
      details: error.message
    });
  }
});

module.exports = router;






