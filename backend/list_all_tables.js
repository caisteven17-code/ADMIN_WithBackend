
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

async function findTables() {
  // We can query the information_schema directly if we have service_role key
  const { data, error } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
  
  if (error) {
    console.error("Error listing tables:", error.message);
    // If we can't query information_schema, we'll try common names again
    const common = ['beneficiary_bank_accounts', 'beneficiary_banking', 'beneficiary_bank_details'];
    for (const t of common) {
        const { error: e } = await supabase.from(t).select('*').limit(1);
        if (!e) console.log("Found table:", t);
    }
  } else {
    console.log("Tables in public schema:");
    data.forEach(t => console.log("- " + t.table_name));
  }
}

findTables();
