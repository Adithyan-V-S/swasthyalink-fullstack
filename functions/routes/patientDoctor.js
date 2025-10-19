/**
 * Patient-Doctor Connection Routes for SwasthyaLink Firebase Functions
 * Handles patient-doctor relationship management
 */

const express = require('express');
const router = express.Router();
const PatientDoctorModel = require('../src/models/patientDoctorModel');
const patientDoctorService = require('../src/services/patientDoctorService');
const { requireAuth, requireDoctor, requirePatient } = require('../src/middleware/auth');

// Create connection request (Doctor only)
router.post('/connection-request', requireDoctor, async (req, res) => {
  try {
    const { patientId, patientEmail, patientPhone, connectionMethod, message } = req.body;
    const doctorId = req.user.uid; // From auth middleware

    if (!patientId && !patientEmail && !patientPhone) {
      return res.status(400).json({
        success: false,
        error: 'Patient identifier (ID, email, or phone) is required'
      });
    }

    if (!connectionMethod || !['qr', 'email', 'otp'].includes(connectionMethod)) {
      return res.status(400).json({
        success: false,
        error: 'Valid connection method is required (qr, email, or otp)'
      });
    }

    const result = await patientDoctorService.sendConnectionRequest(
      doctorId,
      patientId,
      patientEmail,
      patientPhone,
      connectionMethod,
      message
    );

    res.json(result);
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create connection request'
    });
  }
});

// Accept connection request (Patient only)
router.post('/accept-request/:requestId', requirePatient, async (req, res) => {
  try {
    const { requestId } = req.params;
    const patientId = req.user.uid;

    const result = await patientDoctorService.acceptConnectionRequest(requestId, patientId);
    res.json(result);
  } catch (error) {
    console.error('Error accepting connection request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to accept connection request'
    });
  }
});

// Get connection requests for patient
router.get('/requests/patient', requirePatient, async (req, res) => {
  try {
    const patientId = req.user.uid;
    const result = await patientDoctorService.getConnectionRequestsForPatient(patientId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch connection requests'
    });
  }
});

// Get patient's doctors
router.get('/patients/:patientId/doctors', requireAuth, async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await PatientDoctorModel.getPatientDoctors(patientId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching patient doctors:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch patient doctors'
    });
  }
});

// Get doctor's patients
router.get('/doctors/:doctorId/patients', requireDoctor, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await PatientDoctorModel.getDoctorPatients(doctorId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch doctor patients'
    });
  }
});

module.exports = router;






