
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testApprove() {
  const testId = 'ebddb8dd-0e5c-41c3-8ecc-05786aefad84'; // Geo Geo
  console.log('Testing approval for Geo Geo ID:', testId);
  
  const { data, error } = await supabase
    .from('campaign_manager_profiles')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', testId)
    .select();
  
  if (error) {
    console.error('❌ Update failed:', error);
  } else {
    console.log('✅ Update succeeded:', data);
  }
}

testApprove();
