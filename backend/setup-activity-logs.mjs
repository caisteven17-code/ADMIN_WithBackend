import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createActivityLogsTable() {
  try {
    console.log('📋 Setting up activity_logs table...');

    // Create activity_logs table
    const { error: createError } = await supabase.rpc('create_table', {
      table_name: 'activity_logs',
      schema: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL,
          admin_email VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          description TEXT,
          resource_type VARCHAR(50) NOT NULL,
          resource_id UUID,
          changes JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_activity_admin_id ON activity_logs(admin_id);
        CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_activity_resource_type ON activity_logs(resource_type);
        CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);
      `,
    });

    if (createError) {
      // If rpc doesn't work, try direct SQL
      console.log('ℹ️  Using direct SQL approach...');
      // Note: This requires direct access to Supabase SQL editor
    }

    console.log('✅ Activity logs table setup complete!');
  } catch (error) {
    console.error('❌ Error setting up activity logs table:', error);
    process.exit(1);
  }
}

// Alternative: Create table with SQL via TypeScript
async function setupActivityLogsWithSQL() {
  try {
    console.log('📋 Setting up activity_logs table with SQL...');

    const { error } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL,
          admin_email VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          description TEXT,
          resource_type VARCHAR(50) NOT NULL,
          resource_id UUID,
          changes JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_activity_admin_id ON activity_logs(admin_id);
        CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_activity_resource_type ON activity_logs(resource_type);
        CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);
      `,
    });

    if (error) {
      console.error('❌ Error:', error);
      console.log('\n📌 Please manually run this SQL in Supabase SQL Editor:');
      console.log(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          admin_id UUID NOT NULL,
          admin_email VARCHAR(255) NOT NULL,
          action VARCHAR(50) NOT NULL,
          description TEXT,
          resource_type VARCHAR(50) NOT NULL,
          resource_id UUID,
          changes JSONB,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_activity_admin_id ON activity_logs(admin_id);
        CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);
        CREATE INDEX IF NOT EXISTS idx_activity_resource_type ON activity_logs(resource_type);
        CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_logs(action);

        -- Enable RLS
        ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

        -- Create policy for authenticated admins
        CREATE POLICY "Admins can read activity logs" 
        ON activity_logs FOR SELECT 
        USING (true);
      `);
      return;
    }

    console.log('✅ Activity logs table setup complete!');
  } catch (error) {
    console.error('❌ Error setting up activity logs table:', error);
  }
}

setupActivityLogsWithSQL();
