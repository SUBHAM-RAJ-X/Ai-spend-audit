// Fix RLS policies script - This will create the proper policies
// You'll need to run the SQL output in your Supabase SQL Editor

const fs = require('fs');
const path = require('path');

console.log('=== AI Spend Audit - RLS Policy Fix ===\n');

console.log('The following SQL needs to be run in your Supabase SQL Editor:\n');

const sqlFix = `
-- Disable RLS temporarily to drop all policies
ALTER TABLE audits DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public audits are viewable by everyone" ON audits;
DROP POLICY IF EXISTS "Anyone can create audits" ON audits;
DROP POLICY IF EXISTS "Audit owners can update their audits" ON audits;

-- Re-enable RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Create proper policies for public access
CREATE POLICY "Enable read access for all users" ON audits FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON audits FOR UPDATE USING (true) WITH CHECK (true);

-- Alternative: More restrictive policies (uncomment if you want stricter security)
/*
CREATE POLICY "Public audits are viewable by everyone" ON audits FOR SELECT USING (is_public = true);
CREATE POLICY "Anyone can create audits" ON audits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their own audits" ON audits FOR UPDATE USING (true) WITH CHECK (true);
*/

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'audits';
`;

console.log(sqlFix);

console.log('\n=== Steps to Fix Database ===');
console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Go to SQL Editor');
console.log('4. Copy and paste the SQL above');
console.log('5. Click "Run" to execute');
console.log('6. Refresh your app and test the share functionality');

console.log('\n=== Alternative: Disable RLS Entirely (Quick Fix) ===');
console.log('If you want to disable RLS completely for testing:');
console.log('ALTER TABLE audits DISABLE ROW LEVEL SECURITY;');
