// Database setup script for AI Spend Audit
// Run this script to ensure the database tables exist

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually
const envPath = path.join(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.error('Could not read .env.local file:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('audits').select('count').limit(1);
    
    if (error) {
      console.error('Database connection error:', error);
      
      if (error.code === 'PGRST116') {
        console.log('Table does not exist. Please run the schema.sql in your Supabase dashboard:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the contents of supabase/schema.sql');
        console.log('4. Run the script');
        return;
      }
      
      throw error;
    }
    
    console.log('✅ Database is properly set up!');
    console.log('✅ Tables exist and are accessible');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
