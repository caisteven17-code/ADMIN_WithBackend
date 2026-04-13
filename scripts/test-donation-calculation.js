const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hycsbfugiboutvgbvueg.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y3NiZnVnaWJvdXR2Z2J2dWVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMyMzk1MywiZXhwIjoyMDg4ODk5OTUzfQ.t0Y64frQ7GsAHEUBz4D2YXsSPtpk9q9bmoco31sSWEM';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testDonationCalculation() {
  try {
    console.log('🔍 Testing donation calculation...\n');

    const { data, error } = await supabase
      .from('hopecard_purchases')
      .select('amount_paid');

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return;
    }

    console.log(`📝 Raw data from Supabase (${data.length} records):`);
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');

    // Test the calculation
    const total = data?.reduce((sum, donation) => {
      console.log(`Processing: ${donation.amount_paid} (type: ${typeof donation.amount_paid})`);
      const amount = parseFloat(String(donation.amount_paid)) || 0;
      console.log(`  Parsed: ${amount}`);
      return sum + amount;
    }, 0) || 0;

    console.log(`\n💰 Calculated Total: ${total}`);
    
    const formatCurrency = (amount) => {
      if (amount >= 1000000) {
        return `₱${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `₱${(amount / 1000).toFixed(1)}K`;
      } else {
        return `₱${amount.toFixed(2)}`;
      }
    };
    
    console.log(`💰 Formatted: ${formatCurrency(total)}`);

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testDonationCalculation();
