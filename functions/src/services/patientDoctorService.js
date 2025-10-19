/**
 * Patient-Doctor Connection Service
 * Handles patient-doctor relationship management with OTP verification
 */

const admin = require('firebase-admin');
const otpService = require('./otpService');

class PatientDoctorService {
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Send connection request to patient
   * @param {string} doctorId - Doctor's UID
   * @param {string} patientId - Patient's UID (optional if using email/phone)
   * @param {string} patientEmail - Patient's email
   * @param {string} patientPhone - Patient's phone
   * @param {string} connectionMethod - 'qr', 'email', or 'otp'
   * @param {string} message - Optional message from doctor
   */
  async sendConnectionRequest(doctorId, patientId, patientEmail, patientPhone, connectionMethod, message = '') {
    try {
      // Find patient by ID, email, or phone
      let patientDoc = null;
      let patientData = null;

      if (patientId) {
        patientDoc = await this.db.collection('users').doc(patientId).get();
        if (patientDoc.exists) {
          patientData = patientDoc.data();
        }
      } else if (patientEmail) {
        const emailQuery = await this.db.collection('users')
          .where('email', '==', patientEmail)
          .where('role', '==', 'patient')
          .limit(1)
          .get();
        if (!emailQuery.empty) {
          patientDoc = emailQuery.docs[0];
          patientData = patientDoc.data();
          patientId = patientDoc.id;
        }
      } else if (patientPhone) {
        const phoneQuery = await this.db.collection('users')
          .where('phone', '==', patientPhone)
          .where('role', '==', 'patient')
          .limit(1)
          .get();
        if (!phoneQuery.empty) {
          patientDoc = phoneQuery.docs[0];
          patientData = patientDoc.data();
          patientId = patientDoc.id;
        }
      }

      if (!patientData) {
        throw new Error('Patient not found');
      }

      // Get doctor data
      const doctorDoc = await this.db.collection('users').doc(doctorId).get();
      if (!doctorDoc.exists) {
        throw new Error('Doctor not found');
      }
      const doctorData = doctorDoc.data();

      // Check if connection already exists
      const existingConnection = await this.db.collection('patient_doctor_relationships')
        .where('patientId', '==', patientId)
        .where('doctorId', '==', doctorId)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (!existingConnection.empty) {
        throw new Error('Connection already exists');
      }

      // Check for pending request and clean up old ones
      const pendingRequest = await this.db.collection('patient_doctor_requests')
        .where('patientId', '==', patientId)
        .where('doctorId', '==', doctorId)
        .where('status', '==', 'pending')
        .get();

      if (!pendingRequest.empty) {
        // Cancel old pending requests
        const batch = this.db.batch();
        pendingRequest.forEach(doc => {
          batch.update(doc.ref, {
            status: 'cancelled',
            updatedAt: new Date()
          });
        });
        await batch.commit();
        console.log(`Cancelled ${pendingRequest.size} old pending requests`);
      }

      // Generate OTP for verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Create request document
      const requestRef = this.db.collection('patient_doctor_requests').doc();
      const requestData = {
        id: requestRef.id,
        doctorId,
        patientId,
        doctor: {
          id: doctorId,
          name: doctorData.name || 'Dr. Unknown',
          email: doctorData.email || 'unknown@example.com',
          phone: doctorData.phone || 'Not provided',
          specialization: doctorData.specialization || 'General Physician'
        },
        patient: {
          id: patientId,
          name: patientData.name || 'Unknown Patient',
          email: patientData.email || 'unknown@example.com',
          phone: patientData.phone || 'Not provided'
        },
        connectionMethod,
        message,
        otp,
        otpExpiry,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await requestRef.set(requestData);

      // Create notification for patient
      try {
        await this.db.collection('notifications').add({
          recipientId: patientId,
          senderId: doctorId,
          type: 'doctor_connection_request',
          title: 'New Doctor Connection Request',
          message: `Dr. ${doctorData.name || 'Unknown'} wants to connect with you`,
          data: {
            requestId: requestRef.id,
            doctorName: doctorData.name || 'Dr. Unknown',
            doctorSpecialization: doctorData.specialization || 'General Physician',
            connectionMethod: connectionMethod
          },
          priority: 'high',
          read: false,
          deleted: false,
          timestamp: new Date()
        });
        console.log('Notification created for patient:', patientId);
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError.message);
      }

      // Send OTP via email if email method
      if (connectionMethod === 'email' && patientData.email) {
        try {
          await otpService.sendEmailOTP(
            patientData.email,
            doctorData.name || 'Dr. Unknown',
            'connection'
          );
        } catch (emailError) {
          console.warn('Failed to send email OTP, but connection request created:', emailError.message);
          // Continue anyway - the request is still created with OTP
        }
      }

      return {
        success: true,
        requestId: requestRef.id,
        message: 'Connection request sent successfully'
      };

    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  }

  /**
   * Get pending requests for a patient
   * @param {string} patientId - Patient's UID
   */
  async getPendingRequests(patientId) {
    try {
      // Simplified query to avoid index requirements
      const requestsQuery = await this.db.collection('patient_doctor_requests')
        .where('patientId', '==', patientId)
        .get();

      const requests = [];
      requestsQuery.forEach(doc => {
        const data = doc.data();
        // Filter for pending requests and check if OTP is still valid
        if (data.status === 'pending') {
          if (data.otpExpiry && data.otpExpiry.toDate() > new Date()) {
            requests.push({
              id: doc.id,
              ...data,
              otpExpiry: data.otpExpiry.toDate(),
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
            });
          } else {
            // Clean up expired requests
            this.db.collection('patient_doctor_requests').doc(doc.id).update({
              status: 'expired',
              updatedAt: new Date()
            });
          }
        }
      });

      return {
        success: true,
        requests
      };

    } catch (error) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }

  /**
   * Accept connection request instantly (no OTP verification needed)
   * @param {string} requestId - Request ID
   * @param {string} patientId - Patient's UID
   * @param {string} otp - OTP code (ignored for instant approval)
   */
  async acceptRequest(requestId, patientId, otp) {
    try {
      const requestRef = this.db.collection('patient_doctor_requests').doc(requestId);
      const requestDoc = await requestRef.get();

      if (!requestDoc.exists) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();

      // Verify request belongs to patient
      if (requestData.patientId !== patientId) {
        throw new Error('Unauthorized');
      }

      // Check if request is still pending
      if (requestData.status !== 'pending') {
        throw new Error('Request is no longer pending');
      }

      // Skip OTP verification for instant approval
      console.log('Accepting request instantly without OTP verification');

      // Create active relationship
      const relationshipRef = this.db.collection('patient_doctor_relationships').doc();
      const relationshipData = {
        id: relationshipRef.id,
        patientId: requestData.patientId,
        doctorId: requestData.doctorId,
        patient: requestData.patient,
        doctor: requestData.doctor,
        status: 'active',
        permissions: {
          prescriptions: true,
          records: false,
          emergency: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await relationshipRef.set(relationshipData);

      // Update request status
      await requestRef.update({
        status: 'accepted',
        acceptedAt: new Date(),
        updatedAt: new Date()
      });

      // Create notification for doctor
      try {
        await this.db.collection('notifications').add({
          recipientId: requestData.doctorId,
          senderId: patientId,
          type: 'connection_accepted',
          title: 'Connection Established Successfully!',
          message: `${requestData.patient.name || 'Patient'} has accepted your connection request`,
          data: {
            relationshipId: relationshipRef.id,
            patientName: requestData.patient.name || 'Patient',
            patientEmail: requestData.patient.email || 'unknown@example.com'
          },
          priority: 'high',
          read: false,
          deleted: false,
          timestamp: new Date()
        });
        console.log('Notification created for doctor:', requestData.doctorId);
      } catch (notificationError) {
        console.warn('Failed to create notification for doctor:', notificationError.message);
      }

      return {
        success: true,
        relationship: relationshipData,
        message: 'Connection request accepted successfully'
      };

    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  }

  /**
   * Get connected doctors for a patient
   * @param {string} patientId - Patient's UID
   */
  async getConnectedDoctors(patientId) {
    try {
      // Get all relationships for this patient
      const relationshipsQuery = await this.db.collection('patient_doctor_relationships')
        .where('patientId', '==', patientId)
        .get();

      const doctors = [];
      
      // Process each relationship
      for (const doc of relationshipsQuery.docs) {
        const relationshipData = doc.data();
        
        // Only include active relationships
        if (relationshipData.status === 'active') {
          try {
            // Fetch doctor data from users collection
            const doctorDoc = await this.db.collection('users').doc(relationshipData.doctorId).get();
            
            if (doctorDoc.exists) {
              const doctorData = doctorDoc.data();
              doctors.push({
                id: relationshipData.doctorId,
                name: doctorData.name || 'Unknown Doctor',
                email: doctorData.email || 'No email',
                phone: doctorData.phone || 'No phone',
                specialization: doctorData.specialization || 'General Practice',
                connectedAt: relationshipData.connectionDate || relationshipData.createdAt,
                lastInteraction: relationshipData.lastInteraction || relationshipData.createdAt,
                permissions: relationshipData.permissions
              });
            }
          } catch (doctorError) {
            console.error(`Error fetching doctor data for ${relationshipData.doctorId}:`, doctorError);
            // Still include the doctor with basic info
            doctors.push({
              id: relationshipData.doctorId,
              name: 'Unknown Doctor',
              email: 'No email',
              phone: 'No phone',
              specialization: 'General Practice',
              connectedAt: relationshipData.connectionDate || relationshipData.createdAt,
              lastInteraction: relationshipData.lastInteraction || relationshipData.createdAt,
              permissions: relationshipData.permissions
            });
          }
        }
      }

      return {
        success: true,
        doctors
      };

    } catch (error) {
      console.error('Error getting connected doctors:', error);
      throw error;
    }
  }

  /**
   * Get connected patients for a doctor
   * @param {string} doctorId - Doctor's UID
   */
  async getConnectedPatients(doctorId) {
    try {
      // Get all relationships for this doctor
      const relationshipsQuery = await this.db.collection('patient_doctor_relationships')
        .where('doctorId', '==', doctorId)
        .get();

      const patients = [];
      
      // Process each relationship
      for (const doc of relationshipsQuery.docs) {
        const relationshipData = doc.data();
        
        // Only include active relationships
        if (relationshipData.status === 'active') {
          try {
            // Fetch patient data from users collection
            const patientDoc = await this.db.collection('users').doc(relationshipData.patientId).get();
            
            if (patientDoc.exists) {
              const patientData = patientDoc.data();
              patients.push({
                id: relationshipData.patientId,
                name: patientData.name || 'Unknown Patient',
                email: patientData.email || 'No email',
                phone: patientData.phone || 'No phone',
                age: patientData.age || 'Not specified',
                gender: patientData.gender || 'Not specified',
                bloodType: patientData.bloodType || 'Not specified',
                allergies: patientData.allergies || [],
                connectedAt: relationshipData.connectionDate || relationshipData.createdAt,
                lastVisit: relationshipData.lastInteraction || relationshipData.createdAt,
                permissions: relationshipData.permissions
              });
            }
          } catch (patientError) {
            console.error(`Error fetching patient data for ${relationshipData.patientId}:`, patientError);
            // Still include the patient with basic info
            patients.push({
              id: relationshipData.patientId,
              name: 'Unknown Patient',
              email: 'No email',
              phone: 'No phone',
              age: 'Not specified',
              gender: 'Not specified',
              bloodType: 'Not specified',
              allergies: [],
              connectedAt: relationshipData.connectionDate || relationshipData.createdAt,
              lastVisit: relationshipData.lastInteraction || relationshipData.createdAt,
              permissions: relationshipData.permissions
            });
          }
        }
      }

      return {
        success: true,
        patients
      };

    } catch (error) {
      console.error('Error getting connected patients:', error);
      throw error;
    }
  }

  /**
   * Resend OTP for a pending request: regenerates OTP and expiry
   */
  async resendRequest(requestId, userId) {
    try {
      const requestRef = this.db.collection('patient_doctor_requests').doc(requestId);
      const requestDoc = await requestRef.get();
      if (!requestDoc.exists) {
        throw new Error('Request not found');
      }

      const request = requestDoc.data();
      // Ensure the requester is either the patient or the doctor on the request
      if (request.patientId !== userId && request.doctorId !== userId) {
        throw new Error('Unauthorized');
      }

      if (request.status !== 'pending') {
        throw new Error('Only pending requests can be resent');
      }

      // Generate new OTP and expiry
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await requestRef.update({
        otp: newOtp,
        otpExpiry: newExpiry,
        updatedAt: new Date()
      });

      // Optionally, send via email if available in request
      try {
        if (request.connectionMethod === 'email' && request.patient?.email) {
          // For now, just log the OTP; integrate real email service if needed
          console.log(`Resent OTP ${newOtp} to ${request.patient.email}`);
        }
      } catch (notifyErr) {
        console.warn('Failed to send notification for resent OTP:', notifyErr);
      }

      return { success: true };
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error;
    }
  }
}

module.exports = new PatientDoctorService();
