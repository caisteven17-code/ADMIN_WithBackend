
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
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

async function checkApprovals() {
  console.log("--- Checking beneficiary_identity_documents table ---");
  const { data: docs, error: docError, count: docCount } = await supabase
    .from('beneficiary_identity_documents')
    .select('*, beneficiary_profiles(first_name, last_name, email)', { count: 'exact' });

  if (docError) {
    console.error("Error documents:", docError.message);
  } else {
    console.log(`Found ${docCount} document records.`);
    console.log("Sample documents:", JSON.stringify(docs, null, 2));
  }

  console.log("\n--- Checking beneficiary_banking_activities table ---");
  const { data: banks, error: bankError, count: bankCount } = await supabase
    .from('beneficiary_banking_activities')
    .select('*, beneficiary_profiles(first_name, last_name, email)', { count: 'exact' });

  if (bankError) {
    console.error("Error bank:", bankError.message);
  } else {
    console.log(`Found ${bankCount} bank records.`);
    console.log("Sample bank details:", JSON.stringify(banks, null, 2));
  }
}

checkApprovals();
