-- SahakarConnect Supabase Migration (003_password_reset_codes.sql)
-- Secure Password Reset Codes Table for Resend 4-digit PIN verification & Supabase Edge Functions

-- 1. Create Table with Token Verification Columns
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  pin_code VARCHAR(10) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  reset_token TEXT,
  token_expires_at TIMESTAMPTZ,
  token_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes for Rapid Lookup & Rate Limiting
CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_created 
  ON password_reset_codes (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_lookup 
  ON password_reset_codes (email, pin_code, used, expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_token 
  ON password_reset_codes (email, reset_token, token_used, token_expires_at);

-- 3. Row Level Security (RLS)
-- Table is strictly restricted to server-side / service-role executions inside Edge Functions.
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Explicitly Revoke all client privileges from anon and authenticated roles
REVOKE ALL ON password_reset_codes FROM anon, authenticated;

-- Service Role full access policy
CREATE POLICY "Service Role Full Access" 
  ON password_reset_codes 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);
