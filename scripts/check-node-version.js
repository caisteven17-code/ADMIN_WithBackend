const semver = require('semver');
const { execSync } = require('child_process');

// Get Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.error(`❌ Node.js 18.x or later is required. Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log(`✅ Node.js ${nodeVersion} detected`);
