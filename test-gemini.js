const { GoogleAuth } = require('google-auth-library');
const path = require('path');

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...');
    
    // Set credentials path
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'backend/credentialss.json');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/generative-language'],
    });
    
    const client = await auth.getClient();
    console.log('✅ Authentication successful');
    
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    const body = {
      contents: [{
        parts: [{
          text: "Hello, how are you?"
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
        topP: 0.8,
        topK: 40,
      }
    };
    
    console.log('Sending request to Gemini API...');
    const response = await client.request({
      url,
      method: 'POST',
      data: body,
    });
    
    console.log('✅ Gemini API response:', response.data);
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testGeminiAPI();
