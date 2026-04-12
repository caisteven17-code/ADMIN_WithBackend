const fs = require('fs');
const path = require('path');

const frontendEnvPath = path.join(__dirname, '..', '.env.local');
const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');

const frontendEnvExample = path.join(__dirname, '..', '.env.example');
const backendEnvExample = path.join(__dirname, '..', 'backend', '.env.example');

console.log('\n⚙️  Setting up environment files...\n');

// Frontend .env.local
if (!fs.existsSync(frontendEnvPath) && fs.existsSync(frontendEnvExample)) {
  const content = fs.readFileSync(frontendEnvExample, 'utf8');
  fs.writeFileSync(frontendEnvPath, content);
  console.log('✅ Created .env.local (template)');
  console.log('   👉 Edit this file with your Supabase credentials\n');
}

// Backend .env
if (!fs.existsSync(backendEnvPath) && fs.existsSync(backendEnvExample)) {
  const content = fs.readFileSync(backendEnvExample, 'utf8');
  fs.writeFileSync(backendEnvPath, content);
  console.log('✅ Created backend/.env (template)');
  console.log('   👉 Edit this file with your Supabase & Gmail credentials\n');
}

if (fs.existsSync(frontendEnvPath) && fs.existsSync(backendEnvPath)) {
  console.log('✅ Environment files ready!\n');
} else if (!fs.existsSync(frontendEnvPath) || !fs.existsSync(backendEnvPath)) {
  console.log('⚠️  Some environment files still need to be created.\n');
  console.log('Run these commands:\n');
  if (!fs.existsSync(frontendEnvPath)) {
    console.log('  cp .env.example .env.local');
  }
  if (!fs.existsSync(backendEnvPath)) {
    console.log('  cp backend/.env.example backend/.env');
  }
  console.log('\nThen edit both files with your credentials.\n');
}
