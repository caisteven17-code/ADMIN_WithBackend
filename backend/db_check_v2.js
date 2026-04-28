
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

async function inspect() {
  console.log("--- Checking campaign_beneficiaries table ---");
  const { data, error } = await supabase
    .from('campaign_beneficiaries')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error campaign_beneficiaries:", error.message);
  } else if (data && data.length > 0) {
    console.log("Keys in campaign_beneficiaries:", Object.keys(data[0]));
    console.log("Sample row:", JSON.stringify(data[0], null, 2));
  } else {
    console.log("campaign_beneficiaries is empty or does not exist (if error was thrown)");
  }
}

inspect();
