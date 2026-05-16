
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumnTypes() {
  // Query information_schema to get column types
  const { data, error } = await supabase.rpc('get_column_types', { table_name: 'campaign_manager_profiles' });
  
  if (error) {
    console.log('❌ RPC error (get_column_types not found), trying direct query...');
    // Fallback: try to guess from data or use a raw query if possible
    const { data: rawData, error: rawError } = await supabase
      .from('campaign_manager_profiles')
      .select('*')
      .limit(1);
    
    if (rawError) {
      console.error('Error:', rawError.message);
      return;
    }
    
    console.log('Data sample to guess types:', rawData[0]);
  } else {
    console.log('Column types:', data);
  }
}

checkColumnTypes();
