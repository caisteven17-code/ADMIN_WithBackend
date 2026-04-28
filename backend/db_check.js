
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env from current directory
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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or keys in .env");
  console.log("Found keys:", Object.keys(env));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log("--- Inspecting hc_campaigns ---");
  const { data: campaigns, error: cError } = await supabase
    .from('hc_campaigns')
    .select('*')
    .limit(1);

  if (cError) {
    console.error("Error hc_campaigns:", cError.message);
  } else if (campaigns && campaigns.length > 0) {
    console.log("Keys in hc_campaigns:", Object.keys(campaigns[0]));
    console.log("Sample row:", JSON.stringify(campaigns[0], null, 2));
  } else {
    console.log("hc_campaigns is empty");
  }

  console.log("\n--- Inspecting campaign_manager_profiles ---");
  const { data: managers, error: mError } = await supabase
    .from('campaign_manager_profiles')
    .select('*')
    .limit(1);

  if (mError) {
    console.error("Error campaign_manager_profiles:", mError.message);
  } else if (managers && managers.length > 0) {
    console.log("Keys in campaign_manager_profiles:", Object.keys(managers[0]));
    console.log("Sample row:", JSON.stringify(managers[0], null, 2));
  } else {
    console.log("campaign_manager_profiles is empty");
  }
  
  console.log("\n--- Inspecting beneficiary_profiles ---");
  const { data: beneficiaries, error: bError } = await supabase
    .from('beneficiary_profiles')
    .select('*')
    .limit(1);

  if (bError) {
    console.error("Error beneficiary_profiles:", bError.message);
  } else if (beneficiaries && beneficiaries.length > 0) {
    console.log("Keys in beneficiary_profiles:", Object.keys(beneficiaries[0]));
    console.log("Sample row:", JSON.stringify(beneficiaries[0], null, 2));
  }
}

inspect();
