
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect(tableName) {
  console.log(`\n--- Inspecting ${tableName} ---`);
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    console.error(`Error ${tableName}:`, error.message);
  } else if (data && data.length > 0) {
    console.log(`Columns:`, Object.keys(data[0]));
  } else {
    console.log(`${tableName} is empty`);
  }
}

async function run() {
  await inspect('digital_donor_profiles');
  await inspect('campaign_manager_profiles');
  await inspect('beneficiary_profiles');
  await inspect('beneficiary_identity_documents');
  await inspect('beneficiary_bank_accounts');
}

run();
