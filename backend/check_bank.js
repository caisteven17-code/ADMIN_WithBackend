
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

async function checkBankAccounts() {
  const { data, error, count } = await supabase.from('beneficiary_bank_accounts').select('*', { count: 'exact' });
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log(`Found ${count} bank account records.`);
    console.log(JSON.stringify(data, null, 2));
  }
}

checkBankAccounts();
