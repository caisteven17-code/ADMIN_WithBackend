
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchemas() {
  const tables = [
    'campaign_manager_profiles',
    'digital_donor_profiles',
    'beneficiary_profiles',
    'beneficiary_identity_documents',
    'beneficiary_bank_accounts'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.error(`Error with ${table}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Columns in ${table}:`, Object.keys(data[0]));
    } else {
      console.log(`No records in ${table} to check columns.`);
    }
  }
}

checkSchemas();
