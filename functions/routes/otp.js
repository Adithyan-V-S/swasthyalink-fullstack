/**
 * OTP Routes for SwasthyaLink Firebase Functions
 * Handles OTP generation, sending, and verification
 */

const express = require('express');
const router = express.Router();
const otpService = require('../src/services/otpService');
const { requireDoctor } = require('../src/middleware/auth');

// Send OTP via email (Doctor only)
router.post('/send-email', requireDoctor, async (req, res) => {
  try {
    const { email, doctorName, purpose } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    if (!doctorName) {
      return res.status(400).json({
        success: false,
        error: 'Doctor name is required'
      });
    }

    const result = await otpService.sendEmailOTP(email, doctorName, purpose);
    res.json(result);
  } catch (error) {
    console.error('Error sending email OTP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send OTP via email'
    });
  }
});

// Send OTP via SMS (Doctor only)
router.post('/send-sms', requireDoctor, async (req, res) => {
  try {
    const { phone, doctorName, purpose } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }

    if (!doctorName) {
      return res.status(400).json({
        success: false,
        error: 'Doctor name is required'
      });
    }

    const result = await otpService.sendSMSOTP(phone, doctorName, purpose);
    res.json(result);
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send OTP via SMS'
    });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { otp, identifier, type } = req.body;

    if (!otp || !identifier || !type) {
      return res.status(400).json({
        success: false,
        error: 'OTP, identifier, and type are required'
      });
    }

    const result = await otpService.verifyOTP(otp, identifier, type);
    res.json(result);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify OTP'
    });
  }
});

module.exports = router;






