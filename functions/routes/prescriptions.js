/**
 * Prescription Routes for SwasthyaLink Firebase Functions
 * Handles prescription management
 */

const express = require('express');
const router = express.Router();
const PrescriptionModel = require('../src/models/prescriptionModel');
const { requireAuth, requireDoctor, requirePatient } = require('../src/middleware/auth');

// Create prescription (Doctor only)
router.post('/create', requireDoctor, async (req, res) => {
  try {
    const { patientId, medications, diagnosis, instructions, notes, priority, validUntil } = req.body;
    const doctorId = req.user.uid;

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'Patient ID is required' });
    }

    if (!medications || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one medication is required' });
    }

    const result = await PrescriptionModel.createPrescription({
      doctorId,
      patientId,
      medications,
      diagnosis,
      instructions,
      notes,
      priority,
      validUntil
    });

    res.json(result);
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create prescription' });
  }
});

// Get prescriptions for a patient (Patient or Doctor)
router.get('/patient/:patientId', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await PrescriptionModel.getPrescriptionsForPatient(patientId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch prescriptions' });
  }
});

// Get prescriptions issued by a doctor (Doctor only)
router.get('/doctor/:doctorId', requireDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await PrescriptionModel.getPrescriptionsByDoctor(doctorId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch prescriptions' });
  }
});

module.exports = router;








