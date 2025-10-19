/**
 * Firebase Cloud Functions for SwasthyaLink Healthcare Platform
 * Serverless API endpoints for the healthcare platform
 */

const {onRequest} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for cost control
setGlobalOptions({maxInstances: 10});

// Create Express app
const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://swasthyakink.web.app',
    'https://swasthyakink.firebaseapp.com'
  ],
  credentials: true
}));

app.use(express.json());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Optional light mode to speed up emulator initialization
const lightMode = process.env.LIGHT_FUNCTIONS === '1';

if (!lightMode) {
  // Import route modules only when not in light mode
  const notificationRoutes = require('./routes/notifications');
  const presenceRoutes = require('./routes/presence');
  const patientDoctorRoutes = require('./routes/patientDoctor');
  const otpRoutes = require('./routes/otp');
  const prescriptionRoutes = require('./routes/prescriptions');
  const adminRoutes = require('./routes/admin');
  const doctorRoutes = require('./routes/doctors');

  // Mount routes
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/presence', presenceRoutes);
  app.use('/api/patient-doctor', patientDoctorRoutes);
  app.use('/api/otp', otpRoutes);
  app.use('/api/prescriptions', prescriptionRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/doctors', doctorRoutes);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwasthyaLink API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Export the Express app as a Firebase Function
exports.api = onRequest({
  memory: '1GiB',
  timeoutSeconds: 300,
  maxInstances: 10
}, app);

// Export individual functions for better performance (optional)
exports.healthCheck = onRequest((req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SwasthyaLink API',
    version: '1.0.0'
  });
});