
async function test() {
  try {
    console.log('Testing connection to Gateway (http://127.0.0.1:5000/api/health)...');
    const healthResponse = await fetch('http://127.0.0.1:5000/api/health');
    console.log('Health Status:', healthResponse.status);
    console.log('Health Body:', await healthResponse.json());

    console.log('\nTesting connection to Approvals Service (http://127.0.0.1:5003/approvals/campaign-managers)...');
    const approvalsResponse = await fetch('http://127.0.0.1:5003/approvals/campaign-managers');
    console.log('Approvals Status:', approvalsResponse.status);
    // This might return 401/403 because of @Protected(), which is fine, it means it's reachable.
    console.log('Approvals Body:', await approvalsResponse.text());

    console.log('\nTesting connection to Next.js API route (http://localhost:3000/api/approvals/campaign-managers?page=1&limit=100)...');
    const nextApiResponse = await fetch('http://localhost:3000/api/approvals/campaign-managers?page=1&limit=100');
    console.log('Next.js API Status:', nextApiResponse.status);
    console.log('Next.js API Body:', await nextApiResponse.text());
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
