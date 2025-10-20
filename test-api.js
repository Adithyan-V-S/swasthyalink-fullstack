// Test the pending requests API
const https = require('https');

function testAPI() {
  console.log('🧪 Testing pending requests API...');
  
  const options = {
    hostname: 'swasthyalink-backend-v2.onrender.com',
    port: 443,
    path: '/api/patient-doctor/requests',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer test-patient-token',
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📊 API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.requests) {
          console.log(`✅ Found ${response.requests.length} pending requests`);
          response.requests.forEach((req, index) => {
            console.log(`--- Request ${index + 1} ---`);
            console.log('ID:', req.id);
            console.log('Doctor:', req.doctor?.name);
            console.log('Status:', req.status);
            console.log('Patient ID:', req.patientId);
            console.log('Patient Email:', req.patientEmail);
          });
        } else {
          console.log('❌ No requests found or API error');
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing API:', error);
  });
  
  req.end();
}

testAPI();
