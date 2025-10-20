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

async function checkPatientRecords() {
  try {
    console.log('🔍 Checking patient records for vsadithyan215@gmail.com...');
    
    // Get all patient records with this email
    const patientQuery = await db.collection('users')
      .where('email', '==', 'vsadithyan215@gmail.com')
      .where('role', '==', 'patient')
      .get();
    
    console.log(`Found ${patientQuery.size} patient records:`);
    
    patientQuery.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Patient ${index + 1} ---`);
      console.log('Document ID:', doc.id);
      console.log('Name:', data.name);
      console.log('Email:', data.email);
      console.log('Role:', data.role);
      console.log('Created At:', data.createdAt?.toDate?.() || data.createdAt);
    });
    
    // Check if there are any requests for this email
    console.log('\n🔍 Checking requests for this email...');
    
    const requestsByEmail = await db.collection('patient_doctor_requests')
      .where('patient.email', '==', 'vsadithyan215@gmail.com')
      .get();
    
    console.log(`Found ${requestsByEmail.size} requests by patient.email:`);
    requestsByEmail.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Request ${index + 1} ---`);
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Patient ID:', data.patientId);
      console.log('Patient Email:', data.patient?.email);
      console.log('Doctor:', data.doctor?.name);
    });
    
    // Check if there are any requests for this email in the patientEmail field
    const requestsByPatientEmail = await db.collection('patient_doctor_requests')
      .where('patientEmail', '==', 'vsadithyan215@gmail.com')
      .get();
    
    console.log(`\nFound ${requestsByPatientEmail.size} requests by patientEmail field:`);
    requestsByPatientEmail.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Request ${index + 1} ---`);
      console.log('ID:', doc.id);
      console.log('Status:', data.status);
      console.log('Patient ID:', data.patientId);
      console.log('Patient Email:', data.patientEmail);
      console.log('Doctor:', data.doctor?.name);
    });
    
  } catch (error) {
    console.error('❌ Error checking patient records:', error);
  } finally {
    process.exit(0);
  }
}

checkPatientRecords();
