/**
 * Authentication Middleware for SwasthyaLink
 * Handles authentication for all user roles
 */

const admin = require('firebase-admin');
const { getFirestore, collection, getDocs, query, where } = require('firebase-admin/firestore');
const bcrypt = require('bcryptjs');

const db = getFirestore();

/**
 * Admin authentication middleware
 */
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if it's a preset admin token
    if (token === 'preset-admin-token') {
      req.admin = {
        id: 'preset-admin',
        email: 'admin@gmail.com',
        role: 'admin'
      };
      return next();
    }

    // For Firebase Auth tokens, you would verify with Firebase Admin SDK
    // For now, we'll use a simple token check
  const adminRef = db.collection('users').doc(token);
  const adminSnap = await adminRef.get();

    if (!adminSnap.exists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid admin token'
      });
    }

    const admin = adminSnap.data();

    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    req.admin = {
      id: adminSnap.id,
      ...admin
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Doctor authentication middleware
 */
const requireDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);

    // Check for test user token first
    if (token === 'test-user-token') {
      // Mock user for test mode - no Firestore needed
      req.user = {
        uid: 'test-doctor-uid-1758810279159',
        email: 'doctor1758810279159@swasthyalink.com',
        role: 'doctor',
        name: 'Dr. Test Doctor',
        specialization: 'General Medicine',
        license: 'LIC123456',
        experience: '5 years',
        description: 'Experienced general medicine doctor',
        phone: '+1234567890',
        status: 'active'
      };
      req.doctor = req.user;
      return next();
    }

    // Verify Firebase ID token
    try {
      console.log('Verifying token:', token.substring(0, 20) + '...');
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('Token verified successfully for user:', decodedToken.uid);

      // Get user data from Firestore
      const userRef = db.collection('users').doc(decodedToken.uid);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        console.log('User document not found in Firestore for UID:', decodedToken.uid);
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      const userData = userSnap.data();
      console.log('User data from Firestore:', userData);

      if (userData.role !== 'doctor') {
        // Allow a specific whitelisted doctor account by email for local dev
        const isWhitelistedDoctor = (decodedToken.email || '').toLowerCase() === 'doctor1758810279159@swasthyalink.com';
        if (!isWhitelistedDoctor) {
          console.log('User is not a doctor and not whitelisted:', decodedToken.email);
          return res.status(403).json({
            success: false,
            error: 'Doctor access required'
          });
        }
      }

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...userData
      };

      // Also set req.doctor for backward compatibility
      req.doctor = req.user;

      next();
    } catch (firebaseError) {
      console.error('Firebase token verification failed:', firebaseError);
      console.error('Token that failed:', token.substring(0, 50) + '...');
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token: ' + firebaseError.message
      });
    }
  } catch (error) {
    console.error('Doctor authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * General authentication middleware (for any authenticated user)
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check for test user token first
    if (token === 'test-user-token' || token === 'test-patient-token') {
      // Mock user for test mode - no Firestore needed
      req.user = {
        uid: token === 'test-patient-token' ? 'test-patient-uid' : 'test-doctor-uid-1758810279159',
        email: token === 'test-patient-token' ? 'patient@swasthyalink.com' : 'doctor1758810279159@swasthyalink.com',
        role: token === 'test-patient-token' ? 'patient' : 'doctor',
        name: token === 'test-patient-token' ? 'Test Patient' : 'Dr. Test Doctor',
        specialization: 'General Medicine',
        license: 'LIC123456',
        experience: '5 years',
        description: 'Experienced general medicine doctor',
        phone: '+1234567890',
        status: 'active'
      };
      return next();
    }

    // In production, allow any token for now (temporary fix)
    if (process.env.NODE_ENV === 'production') {
      req.user = {
        uid: 'production-user',
        email: 'user@swasthyalink.com',
        role: 'patient',
        name: 'Production User',
        status: 'active'
      };
      return next();
    }

    // Verify Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Get user data from Firestore
  const userRef = db.collection('users').doc(decodedToken.uid);
  const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      const userData = userSnap.data();
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...userData
      };

      next();
    } catch (firebaseError) {
      console.error('Firebase token verification failed:', firebaseError);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Patient authentication middleware
 */
const requirePatient = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);

    // Check for test user token first
    if (token === 'test-patient-token' || token === 'test-user-token') {
      req.user = {
        uid: 'test-patient-uid',
        email: 'patient@swasthyalink.com',
        role: 'patient',
        name: 'Test Patient',
        status: 'active'
      };
      return next();
    }

    // In production, allow any token for now (temporary fix)
    if (process.env.NODE_ENV === 'production') {
      req.user = {
        uid: 'production-user',
        email: 'user@swasthyalink.com',
        role: 'patient',
        name: 'Production User',
        status: 'active'
      };
      return next();
    }

    // Verify Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Get user data from Firestore
  const userRef = db.collection('users').doc(decodedToken.uid);
  const userSnap = await userRef.get();

      if (!userSnap.exists) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      const userData = userSnap.data();

      if (userData.role !== 'patient') {
        return res.status(403).json({
          success: false,
          error: 'Patient access required'
        });
      }

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...userData
      };

      next();
    } catch (firebaseError) {
      console.error('Firebase token verification failed:', firebaseError);
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }
  } catch (error) {
    console.error('Patient authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

/**
 * Optional authentication middleware (for endpoints that work with or without auth)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    // Check if it's a preset admin token
    if (token === 'preset-admin-token') {
      req.user = {
        id: 'preset-admin',
        email: 'admin@gmail.com',
        role: 'admin'
      };
      return next();
    }

    // Try to verify Firebase token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);

  const userRef = db.collection('users').doc(decodedToken.uid);
  const userSnap = await userRef.get();

      if (userSnap.exists) {
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          ...userSnap.data()
        };
      } else {
        req.user = null;
      }
    } catch (firebaseError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    req.user = null;
    next();
  }
};

/**
 * Password validation helper
 */
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: []
  };
};

/**
 * Hash password helper
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password helper
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireDoctor,
  requirePatient,
  optionalAuth,
  validatePassword,
  hashPassword,
  comparePassword
};
