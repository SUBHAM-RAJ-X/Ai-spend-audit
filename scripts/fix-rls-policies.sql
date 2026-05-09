-- Fix RLS policies for audits table
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Public audits are viewable by everyone" ON audits;
DROP POLICY IF EXISTS "Anyone can create audits" ON audits;
DROP POLICY IF EXISTS "Audit owners can update their audits" ON audits;

-- Create new policies with proper permissions
CREATE POLICY "Public audits are viewable by everyone"
  ON audits FOR SELECT
  USING (is_public = true);

CREATE POLICY "Anyone can create audits"
  ON audits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update audits"
  ON audits FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Enable RLS
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

-- Test the policies
SELECT * FROM pg_policies WHERE tablename = 'audits';
