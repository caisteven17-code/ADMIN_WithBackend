
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
  const testId = 'ce2887d9-b736-4018-a5ca-8b14ee1c3187';
  console.log('Testing update for ID:', testId);
  
  const { data, error } = await supabase
    .from('campaign_manager_profiles')
    .update({
      status: 'pending',
      approved_by: 'admin'
    })
    .eq('id', testId)
    .select();
  
  if (error) {
    console.error('❌ Update failed:', error.message);
    console.error('Error details:', error);
  } else {
    console.log('✅ Update succeeded:', data);
  }
}

testUpdate();
