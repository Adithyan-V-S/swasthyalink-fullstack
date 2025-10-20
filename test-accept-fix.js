const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testAcceptAPI = async () => {
  console.log('🧪 Testing accept API with test token...');
  
  try {
    const response = await fetch('https://swasthyalink-backend-v2.onrender.com/api/patient-doctor/accept/4hFqw4dVDDWDznzunpE5', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-patient-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ API Error:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response Data:', data);
  } catch (error) {
    console.error('❌ Error during API test:', error);
  }
};

testAcceptAPI();
