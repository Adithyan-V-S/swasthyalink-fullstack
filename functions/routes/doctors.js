/**
 * Doctor Routes for SwasthyaLink Firebase Functions
 * Handles doctor-specific operations
 */

const express = require('express');
const router = express.Router();
const DoctorModel = require('../src/models/doctorModel');
const { requireDoctor } = require('../src/middleware/auth');

// Doctor registration endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('Received registration data:', req.body);
    const { name, email, specialization, license, experience, description, phone } = req.body;

    if (!name || !email || !specialization || !license || !phone) {
      console.log('Missing required fields:', { name, email, specialization, license, phone });
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, email, specialization, license, phone'
      });
    }

    const result = await DoctorModel.submitRegistration({
      name,
      email,
      specialization,
      license,
      experience: experience || '',
      description: description || '',
      phone
    });

    res.json(result);
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit registration'
    });
  }
});

// Doctor login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await DoctorModel.authenticateDoctor(email, password);
    res.json(result);
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Login failed'
    });
  }
});

// Get doctor profile
router.get('/profile/:doctorId', requireDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await DoctorModel.getDoctorById(doctorId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch doctor profile'
    });
  }
});

// Update doctor profile
router.put('/profile/:doctorId', requireDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updateData = req.body;
    
    const result = await DoctorModel.updateDoctor(doctorId, updateData);
    res.json(result);
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update doctor profile'
    });
  }
});

// Get all doctors (for patient search)
router.get('/search', async (req, res) => {
  try {
    const { specialization, location, limit = 20 } = req.query;
    
    const result = await DoctorModel.searchDoctors({
      specialization,
      location,
      limit: parseInt(limit)
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search doctors'
    });
  }
});

module.exports = router;






