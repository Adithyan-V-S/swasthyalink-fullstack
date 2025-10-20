const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./credentialss.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin initialized');
} catch (e) {
  console.error('❌ Firebase Admin init failed:', e.message);
  process.exit(1);
}

const db = admin.firestore();

async function checkRequests() {
  try {
    console.log('🔍 Checking recent connection requests...');
    
    // Get all recent requests
    const requestsSnapshot = await db.collection('patient_doctor_requests')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    console.log(`Found ${requestsSnapshot.size} recent requests:`);
    
    requestsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Request ${index + 1} ---`);
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Doctor ID:', data.doctorId);
      console.log('Doctor Name:', data.doctor?.name);
      console.log('Doctor Email:', data.doctor?.email);
      console.log('Patient ID:', data.patientId);
      console.log('Patient Email:', data.patient?.email);
      console.log('Patient Email (field):', data.patientEmail);
      console.log('Connection Method:', data.connectionMethod);
      console.log('Created At:', data.createdAt?.toDate?.() || data.createdAt);
    });
    
    // Check for specific patient
    const patientEmail = 'vsadithyan215@gmail.com';
    console.log(`\n🔍 Checking requests for patient email: ${patientEmail}`);
    
    const patientRequests = await db.collection('patient_doctor_requests')
      .where('patient.email', '==', patientEmail)
      .get();
    
    console.log(`Found ${patientRequests.size} requests for ${patientEmail}`);
    
    patientRequests.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Patient Request ${index + 1} ---`);
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Doctor Name:', data.doctor?.name);
      console.log('Created At:', data.createdAt?.toDate?.() || data.createdAt);
    });
    
  } catch (error) {
    console.error('❌ Error checking requests:', error);
  } finally {
    process.exit(0);
  }
}

checkRequests();
