const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testBackendDebug = async () => {
  console.log('🧪 Testing backend with detailed debugging...');
  
  // Test 1: Check if the route exists
  console.log('\n1. Testing route existence...');
  try {
    const response = await fetch('https://swasthyalink-backend-v2.onrender.com/api/patient-doctor/accept/test-request-id', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-patient-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    const data = await response.json();
    console.log('📡 Response data:', data);
  } catch (error) {
    console.error('❌ Error:', error);
  }

  // Test 2: Check health endpoint
  console.log('\n2. Testing health endpoint...');
  try {
    const response = await fetch('https://swasthyalink-backend-v2.onrender.com/health');
    const data = await response.json();
    console.log('📡 Health response:', data);
  } catch (error) {
    console.error('❌ Health check error:', error);
  }

  // Test 3: Check if the middleware is working
  console.log('\n3. Testing middleware with different token...');
  try {
    const response = await fetch('https://swasthyalink-backend-v2.onrender.com/api/patient-doctor/accept/test-request-id', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    console.log('📡 Invalid token status:', response.status);
    const data = await response.json();
    console.log('📡 Invalid token response:', data);
  } catch (error) {
    console.error('❌ Invalid token error:', error);
  }
};

testBackendDebug();
