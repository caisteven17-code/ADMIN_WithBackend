const fs = require('fs');
const path = require('path');

const frontendEnvPath = path.join(__dirname, '..', '.env.local');
const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');

const frontendEnvExample = path.join(__dirname, '..', '.env.example');
const backendEnvExample = path.join(__dirname, '..', 'backend', '.env.example');

let hasErrors = false;

console.log('\n🔍 Checking environment configuration...\n');

// Check frontend .env.local
if (!fs.existsSync(frontendEnvPath)) {
  console.error('❌ Frontend .env.local not found!');
  if (fs.existsSync(frontendEnvExample)) {
    console.log(`   Run: cp .env.example .env.local`);
  }
  hasErrors = true;
} else {
  console.log('✅ Frontend .env.local exists');
}

// Check backend .env
if (!fs.existsSync(backendEnvPath)) {
  console.error('❌ Backend .env not found!');
  if (fs.existsSync(backendEnvExample)) {
    console.log(`   Run: cp backend/.env.example backend/.env`);
  }
  hasErrors = true;
} else {
  console.log('✅ Backend .env exists');
}

console.log('');

if (hasErrors) {
  console.log('📖 For detailed setup instructions, see SETUP_GUIDE.md\n');
  process.exit(1);
}

console.log('✅ All environment files configured!\n');
