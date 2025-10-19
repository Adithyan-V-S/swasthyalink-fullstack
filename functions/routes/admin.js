/**
 * Admin Routes for SwasthyaLink Firebase Functions
 * Handles admin-specific operations
 */

const express = require('express');
const router = express.Router();
const DoctorModel = require('../src/models/doctorModel');
const { requireAdmin } = require('../src/middleware/auth');

// Get all doctors (Admin only)
router.get('/doctors', requireAdmin, async (req, res) => {
  try {
    const result = await DoctorModel.getAllDoctors();
    res.json(result);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch doctors' });
  }
});

module.exports = router;








