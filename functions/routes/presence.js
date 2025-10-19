/**
 * Presence Routes for SwasthyaLink Firebase Functions
 * Handles real-time presence tracking
 */

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

// Update user presence
router.post('/update', async (req, res) => {
  try {
    const { userId, status, lastSeen, location } = req.body;

    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        error: 'userId and status are required'
      });
    }

    const presenceData = {
      userId,
      status,
      lastSeen: lastSeen || admin.firestore.FieldValue.serverTimestamp(),
      location: location || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('presence').doc(userId).set(presenceData, { merge: true });

    res.json({
      success: true,
      message: 'Presence updated successfully'
    });
  } catch (error) {
    console.error('Error updating presence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update presence',
      details: error.message
    });
  }
});

// Get user presence
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const doc = await db.collection('presence').doc(userId).get();
    
    if (!doc.exists) {
      return res.json({
        success: true,
        presence: null,
        message: 'No presence data found'
      });
    }

    res.json({
      success: true,
      presence: doc.data()
    });
  } catch (error) {
    console.error('Error fetching presence:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch presence',
      details: error.message
    });
  }
});

// Get online users
router.get('/online', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const snapshot = await db.collection('presence')
      .where('status', '==', 'online')
      .orderBy('lastSeen', 'desc')
      .limit(parseInt(limit))
      .get();

    const onlineUsers = [];
    snapshot.forEach(doc => {
      onlineUsers.push({
        userId: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      onlineUsers,
      count: onlineUsers.length
    });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch online users',
      details: error.message
    });
  }
});

module.exports = router;






