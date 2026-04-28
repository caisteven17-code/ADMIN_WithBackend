
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

async function inspect() {
  console.log("Checking campaign 6151961d-875f-4753-8103-5f47f7b99a2d");
  const { data, error } = await supabase
    .from('hc_campaigns')
    .select('title')
    .eq('id', '6151961d-875f-4753-8103-5f47f7b99a2d')
    .single();

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Title:", data.title);
  }
}

inspect();
