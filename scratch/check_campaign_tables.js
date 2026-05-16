
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCampaignTables() {
  const tables = [
    'campaign_managers',
    'campaign_manager_profiles',
    'campaign_manager_registrations',
    'campaign_manager_verification',
    'campaign_manager'
  ];

  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Table '${table}' error:`, error.message);
    } else {
      console.log(`✅ Table '${table}' exists with ${count} records.`);
    }
  }
}

checkCampaignTables();
