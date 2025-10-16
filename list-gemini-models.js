const { GoogleAuth } = require('google-auth-library');
const path = require('path');

async function listGeminiModels() {
  try {
    console.log('Listing available Gemini models...');
    
    // Set credentials path
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'backend/credentialss.json');
    
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/generative-language'],
    });
    
    const client = await auth.getClient();
    console.log('✅ Authentication successful');
    
    const url = 'https://generativelanguage.googleapis.com/v1beta/models';
    
    console.log('Fetching available models...');
    const response = await client.request({
      url,
      method: 'GET',
    });
    
    console.log('✅ Available models:');
    if (response.data && response.data.models) {
      response.data.models.forEach(model => {
        console.log(`- ${model.name}: ${model.displayName || 'No display name'}`);
      });
    } else {
      console.log('No models found or unexpected response format');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error listing Gemini models:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

listGeminiModels();


