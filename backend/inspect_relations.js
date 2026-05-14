
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

async function inspectProfileRelations() {
  console.log("Inspecting beneficiary_profiles relationships...");
  const { data, error } = await supabase
    .from('beneficiary_profiles')
    .select('*, hc_campaigns(*)')
    .limit(1);

  if (error) {
    console.error("Error joining with hc_campaigns:", error.message);
    // Try without hc_campaigns
    const { data: d2, error: e2 } = await supabase
        .from('beneficiary_profiles')
        .select('*')
        .limit(1);
    console.log("Profile keys:", Object.keys(d2[0]));
  } else {
    console.log("Join with hc_campaigns successful!");
  }
}

inspectProfileRelations();
