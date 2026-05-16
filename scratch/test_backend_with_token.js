
const { SignJWT } = require('jose');
const crypto = require('crypto');

async function test() {
  try {
    const JWT_SECRET = new TextEncoder().encode("hopecard-admin-secret-key-change-in-production");
    
    const token = await new SignJWT({ email: 'admin@test.com', role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(JWT_SECRET);

    console.log('Generated Token:', token.substring(0, 20) + '...');

    const url = 'http://127.0.0.1:5000/api/approvals/campaign-managers?page=1&limit=100';
    console.log('Fetching from backend via Gateway:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', response.status);
    const body = await response.text();
    console.log('Body:', body.substring(0, 500));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
