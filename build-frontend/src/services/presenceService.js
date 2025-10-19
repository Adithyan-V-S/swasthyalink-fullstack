import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';

// Presence states
export const PRESENCE_STATES = {
  ONLINE: 'online',
  AWAY: 'away',
  OFFLINE: 'offline'
};

// Update user presence
// Throttle controls to reduce Firestore writes
const WRITE_MIN_INTERVAL_MS = 5 * 60 * 1000; // at most one write every 5 minutes per user/status
let lastPresenceWrite = {
  userId: null,
  status: null,
  timestampMs: 0,
};

export const updateUserPresence = async (userId, status = PRESENCE_STATES.ONLINE) => {
  // Check if this is a test user (mock authentication) or writes explicitly disabled
  const isTestUser = localStorage.getItem('testUser') !== null;
  const presenceWritesDisabled = localStorage.getItem('disablePresenceWrites') === 'true';

  if (isTestUser || presenceWritesDisabled) {
    if (presenceWritesDisabled) {
      console.warn('⚠️ Presence writes disabled via localStorage flag `disablePresenceWrites`');
    }
    return { success: true, skipped: true };
  }

  // Throttle repeated writes with same status
  const now = Date.now();
  if (
    lastPresenceWrite.userId === userId &&
    lastPresenceWrite.status === status &&
    now - lastPresenceWrite.timestampMs < WRITE_MIN_INTERVAL_MS
  ) {
    // Skip write
    return { success: true, throttled: true };
  }

  try {
    const presenceRef = doc(db, 'presence', userId);
    await setDoc(
      presenceRef,
      {
        status,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    lastPresenceWrite = { userId, status, timestampMs: now };
    return { success: true };
  } catch (error) {
    // If quota or resource exhausted, allow client to switch off writes
    const message = String(error?.message || '');
    if (message.includes('quota') || message.includes('resource-exhausted')) {
      console.error('🚫 Presence write blocked due to quota; set `localStorage.disablePresenceWrites=true` to pause writes');
    } else {
      console.error('Error updating presence:', error);
    }
    return { success: false, error: error.message };
  }
};

// Set user online
export const setUserOnline = async (userId) => {
  return await updateUserPresence(userId, PRESENCE_STATES.ONLINE);
};

// Set user away
export const setUserAway = async (userId) => {
  return await updateUserPresence(userId, PRESENCE_STATES.AWAY);
};

// Set user offline
export const setUserOffline = async (userId) => {
  return await updateUserPresence(userId, PRESENCE_STATES.OFFLINE);
};

// Subscribe to user presence
export const subscribeToUserPresence = (userId, callback) => {
  try {
    const presenceRef = doc(db, 'presence', userId);

    const unsubscribe = onSnapshot(presenceRef, (doc) => {
      if (doc.exists()) {
        const presence = doc.data();
        callback(presence);
      } else {
        callback({
          status: PRESENCE_STATES.OFFLINE,
          lastSeen: null
        });
      }
    }, (error) => {
      console.error('Error subscribing to user presence:', error);
      callback({
        status: PRESENCE_STATES.OFFLINE,
        lastSeen: null
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up presence subscription:', error);
    return null;
  }
};

// Subscribe to multiple users' presence
export const subscribeToMultipleUsersPresence = (userIds, callback) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    callback({});
    return null;
  }

  const presenceData = {};
  const unsubscribeFunctions = [];

  userIds.forEach(userId => {
    const unsubscribe = subscribeToUserPresence(userId, (presence) => {
      presenceData[userId] = presence;
      callback({ ...presenceData });
    });
    
    if (unsubscribe) {
      unsubscribeFunctions.push(unsubscribe);
    }
  });

  // Return cleanup function
  return () => {
    unsubscribeFunctions.forEach(unsubscribe => {
      if (unsubscribe) unsubscribe();
    });
  };
};

// Get batch presence data (one-time fetch)
export const getBatchPresenceData = async (userIds) => {
  // Check if this is a test user (mock authentication)
  const isTestUser = localStorage.getItem('testUser') !== null;

  if (isTestUser) {
    console.log('🧪 Using test user - returning empty presence data');
    const presenceData = {};
    userIds.forEach(userId => {
      presenceData[userId] = {
        status: PRESENCE_STATES.OFFLINE,
        lastSeen: null
      };
    });
    return { success: true, presenceData };
  }

  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { success: true, presenceData: {} };
    }

    const presenceData = {};

    // Firestore has a limit of 10 documents per 'in' query
    const batches = [];
    for (let i = 0; i < userIds.length; i += 10) {
      batches.push(userIds.slice(i, i + 10));
    }

    for (const batch of batches) {
      const presenceRef = collection(db, 'presence');
      const q = query(presenceRef, where('__name__', 'in', batch));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const presence = doc.data();
        presenceData[doc.id] = presence;
      });
    }

    // Fill in missing users with offline status
    userIds.forEach(userId => {
      if (!presenceData[userId]) {
        presenceData[userId] = {
          status: PRESENCE_STATES.OFFLINE,
          lastSeen: null
        };
      }
    });

    return { success: true, presenceData };
  } catch (error) {
    console.error('Error fetching batch presence data:', error);
    return { success: false, error: error.message, presenceData: {} };
  }
};

// Auto presence management
class PresenceManager {
  constructor(userId) {
    this.userId = userId;
    this.isActive = true;
    this.awayTimeout = null;
    this.offlineTimeout = null;
    this.heartbeatInterval = null;
    
    this.AWAY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    this.OFFLINE_THRESHOLD = 30 * 60 * 1000; // 30 minutes
    // Increase heartbeat interval to reduce Firestore writes
    this.HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes
    
    this.init();
  }

  init() {
    if (!this.userId) return;

    // Set user online initially (throttled inside update function)
    setUserOnline(this.userId);

    // Set up activity listeners
    this.setupActivityListeners();
    
    // Set up heartbeat
    this.startHeartbeat();
    
    // Handle page visibility changes
    this.setupVisibilityListener();
    
    // Handle beforeunload
    this.setupBeforeUnloadListener();
  }

  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimers = () => {
      this.isActive = true;
      
      // Clear existing timers
      if (this.awayTimeout) {
        clearTimeout(this.awayTimeout);
      }
      if (this.offlineTimeout) {
        clearTimeout(this.offlineTimeout);
      }
      
      // Set user online if not already (throttled)
      setUserOnline(this.userId);
      
      // Set away timer
      this.awayTimeout = setTimeout(() => {
        this.isActive = false;
        setUserAway(this.userId);
      }, this.AWAY_THRESHOLD);
      
      // Set offline timer
      this.offlineTimeout = setTimeout(() => {
        setUserOffline(this.userId);
      }, this.OFFLINE_THRESHOLD);
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimers, true);
    });

    // Initial timer setup
    resetTimers();
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isActive) {
        setUserOnline(this.userId);
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        setUserAway(this.userId);
      } else {
        setUserOnline(this.userId);
      }
    });
  }

  setupBeforeUnloadListener() {
    window.addEventListener('beforeunload', () => {
      // Avoid extra write on unload; rely on clients to update later
      // setUserOffline(this.userId);
    });
  }

  destroy() {
    // Clear timers
    if (this.awayTimeout) clearTimeout(this.awayTimeout);
    if (this.offlineTimeout) clearTimeout(this.offlineTimeout);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    
    // Avoid forcing an offline write during destroy to reduce writes
  }
}

// Global presence manager instance
let globalPresenceManager = null;

// Initialize presence tracking for a user
export const initializePresenceTracking = (userId) => {
  // If writes are disabled or this is a test user, skip initializing presence entirely
  const presenceWritesDisabled = localStorage.getItem('disablePresenceWrites') === 'true';
  const isTestUser = localStorage.getItem('testUser') !== null;
  if (presenceWritesDisabled || isTestUser) {
    console.warn('⚠️ Skipping presence initialization (writes disabled or test user)');
    return () => {};
  }

  if (globalPresenceManager) {
    globalPresenceManager.destroy();
  }
  
  if (userId) {
    globalPresenceManager = new PresenceManager(userId);
  }
};

// Cleanup presence tracking
export const cleanupPresenceTracking = () => {
  if (globalPresenceManager) {
    globalPresenceManager.destroy();
    globalPresenceManager = null;
  }
};

// Format presence status for display
export const formatPresenceStatus = (presence) => {
  if (!presence) return 'Offline';
  
  const { status, lastSeen } = presence;
  
  switch (status) {
    case PRESENCE_STATES.ONLINE:
      return 'Online';
    case PRESENCE_STATES.AWAY:
      return 'Away';
    case PRESENCE_STATES.OFFLINE:
      if (lastSeen) {
        const lastSeenDate = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
        const now = new Date();
        const diffMs = now - lastSeenDate;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return 'Long time ago';
      }
      return 'Offline';
    default:
      return 'Offline';
  }
};

// Get presence status color class
export const getPresenceStatusColor = (status) => {
  switch (status) {
    case PRESENCE_STATES.ONLINE:
      return 'bg-green-500';
    case PRESENCE_STATES.AWAY:
      return 'bg-yellow-500';
    case PRESENCE_STATES.OFFLINE:
    default:
      return 'bg-gray-400';
  }
};