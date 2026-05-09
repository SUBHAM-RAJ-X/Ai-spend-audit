-- Quick fix: Disable RLS for audits table
-- Run this in your Supabase SQL Editor to immediately fix the share functionality

ALTER TABLE audits DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'audits';

-- After running this, the share functionality should work immediately
-- You can re-enable RLS later with: ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
