const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hycsbfugiboutvgbvueg.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3NiZnVnaWJvdXR2Z2J2dWVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyMzk1MywiZXhwIjoyMDg4ODk5OTUzfQ.t0Y64frQ7GsAHEUBz4D2YXsSPtpk9q9bmoco31sSWEM';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkHopecardPurchases() {
  try {
    console.log('🔍 Checking hopecard_purchases table...\n');

    // First, check total count
    const { count, error: countError } = await supabase
      .from('hopecard_purchases')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error fetching count:', countError.message);
      return;
    }

    console.log(`📊 Total records in hopecard_purchases: ${count}\n`);

    // Fetch all records
    const { data, error } = await supabase
      .from('hopecard_purchases')
      .select('*');

    if (error) {
      console.error('❌ Error fetching data:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No records found in hopecard_purchases table');
      return;
    }

    console.log(`✅ Found ${data.length} records:\n`);

    // Display each record
    data.forEach((record, index) => {
      console.log(`Record ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Amount Paid: ${record.amount_paid}`);
      console.log(`  Campaign ID: ${record.campaign_id || 'N/A'}`);
      console.log(`  Donor ID: ${record.donor_id || 'N/A'}`);
      console.log(`  Status: ${record.status || 'N/A'}`);
      console.log('');
    });

    // Calculate total
    const total = data.reduce((sum, record) => {
      const amount = parseFloat(record.amount_paid) || 0;
      return sum + amount;
    }, 0);

    console.log(`\n💰 Total donations: ₱${total.toFixed(2)}`);

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

checkHopecardPurchases();
