const https = require('https');

function testAcceptAPI() {
  console.log('🧪 Testing accept request API...');
  
  const requestId = 'qte1N7IXB3YIFQ0Md4xm';
  const postData = JSON.stringify({ otp: '' });
  
  const options = {
    hostname: 'swasthyalink-backend-v2.onrender.com',
    port: 443,
    path: `/api/patient-doctor/accept/${requestId}`,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer test-patient-token',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📊 Status Code:', res.statusCode);
      console.log('📊 Response Headers:', res.headers);
      
      try {
        const response = JSON.parse(data);
        console.log('📊 API Response:', JSON.stringify(response, null, 2));
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing API:', error);
  });
  
  req.write(postData);
  req.end();
}

testAcceptAPI();
