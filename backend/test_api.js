
const fetch = require('node-fetch');

async function testApi() {
  const BACKEND_URL = 'http://127.0.0.1:5000';
  // We need a token. I'll try to find one or just see if the endpoint is reachable.
  // Actually, I'll check the service logs if I can.
  
  console.log("Testing GET /api/approvals/beneficiaries/bank");
  try {
    const response = await fetch(`${BACKEND_URL}/api/approvals/beneficiaries/bank`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No token, but let's see if it returns 401 or something else
      }
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testApi();
