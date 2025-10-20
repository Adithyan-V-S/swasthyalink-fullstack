/**
 * Test script to check if prescription API is working
 */

const API_BASE = 'https://swasthyalink-backend-v2.onrender.com/api/prescriptions';

async function testPrescriptionAPI() {
  try {
    console.log('🧪 Testing prescription API...');
    console.log('🌐 API Base URL:', API_BASE);
    
    // Test with test token
    const response = await fetch(`${API_BASE}/patient`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-patient-token',
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPrescriptionAPI();
