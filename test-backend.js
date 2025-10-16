/**
 * Test script to verify backend functionality
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testBackend() {
  console.log('🧪 Testing SwasthyaLink Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test chatbot endpoint
    console.log('\n2. Testing chatbot endpoint...');
    const chatbotResponse = await fetch(`${API_BASE}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, how are you?' })
    });
    const chatbotData = await chatbotResponse.json();
    console.log('✅ Chatbot response:', chatbotData);

    // Test Gemini endpoint
    console.log('\n3. Testing Gemini endpoint...');
    const geminiResponse = await fetch(`${API_BASE}/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What is health?' })
    });
    const geminiData = await geminiResponse.json();
    console.log('✅ Gemini response:', geminiData);

    console.log('\n🎉 All backend tests passed!');
  } catch (error) {
    console.error('❌ Backend test failed:', error.message);
    console.log('\n💡 Make sure the backend server is running:');
    console.log('   cd backend && npm start');
  }
}

testBackend();
