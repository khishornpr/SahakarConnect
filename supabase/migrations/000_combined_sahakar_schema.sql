-- =====================================================================
-- SahakarConnect (SIH26089) Consolidated Database Schema
-- Cooperative-Owned Digital Service Marketplace Platform
-- =====================================================================

-- 1. Cooperatives Table (Federations & Societies)
CREATE TABLE IF NOT EXISTS cooperatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  registration_no TEXT UNIQUE NOT NULL,
  district TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Delhi',
  fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Extended Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'household', 'cooperative', 'manager', 'officer', 'labor_officer', 'owner', 'labor')),
  phone TEXT,
  avatar_url TEXT,
  district TEXT DEFAULT 'South Delhi',
  trade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workers Profile (Trade skills, Cooperative link, KYC status)
CREATE TABLE IF NOT EXISTS workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE SET NULL,
  primary_trade TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  experience_years INT DEFAULT 1,
  hourly_rate DECIMAL(10,2) DEFAULT 350.00,
  is_verified BOOLEAN DEFAULT FALSE,
  gov_id_type TEXT DEFAULT 'Aadhaar',
  gov_id_masked TEXT DEFAULT 'XXXX-XXXX-1234',
  kyc_document_url TEXT,
  area TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_ratings INT DEFAULT 0,
  completed_jobs_count INT DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Households (Customers)
CREATE TABLE IF NOT EXISTS households (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  landmark TEXT,
  rating DECIMAL(3,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Jobs / Service Requests
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_worker_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  trade_category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot TEXT NOT NULL,
  estimated_hours DECIMAL(4,2) DEFAULT 1.5,
  estimated_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'requested' 
    CHECK (status IN ('requested', 'assigned', 'in_progress', 'completed', 'cancelled')),
  otp_code TEXT DEFAULT '4829',
  completion_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Job Applications / Auto-Match Assignments
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  distance_km DECIMAL(6,2) NOT NULL,
  matching_score DECIMAL(5,2) NOT NULL,
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Wage Ledger (Fair wage audit & cooperative fee deduction)
CREATE TABLE IF NOT EXISTS wage_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE SET NULL,
  gross_amount DECIMAL(10,2) NOT NULL,
  cooperative_fee_pct DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  cooperative_fee_amount DECIMAL(10,2) NOT NULL,
  welfare_fund_amount DECIMAL(10,2) DEFAULT 10.00,
  net_payout DECIMAL(10,2) NOT NULL,
  payment_mode TEXT DEFAULT 'UPI' CHECK (payment_mode IN ('UPI', 'RuPay', 'NetBanking', 'Cash')),
  payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'flagged')),
  is_anomalous BOOLEAN DEFAULT FALSE,
  anomaly_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Two-Way Ratings & Reviews
CREATE TABLE IF NOT EXISTS ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  rater_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rated_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rater_role TEXT NOT NULL CHECK (rater_role IN ('household', 'worker')),
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  tags TEXT[] DEFAULT '{}',
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Cooperative Welfare Schemes
CREATE TABLE IF NOT EXISTS welfare_schemes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('insurance', 'health', 'pension', 'emergency_aid')),
  coverage_amount DECIMAL(12,2) NOT NULL,
  monthly_premium DECIMAL(8,2) NOT NULL,
  govt_subsidy_pct DECIMAL(5,2) DEFAULT 50.00,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Financial Module (Salaries, Transactions, Complaints, Learning)
CREATE TABLE IF NOT EXISTS salaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salary_increments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  previous_amount DECIMAL(12,2) NOT NULL,
  new_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(12,2) NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  initiator_role TEXT DEFAULT 'worker' CHECK (initiator_role IN ('worker', 'household', 'manager')),
  complaint_type TEXT NOT NULL CHECK (complaint_type IN ('Non-Payment', 'Unsafe Job Site', 'Customer Dispute', 'Harassment', 'Unsatisfactory Service', 'Overcharging', 'Property Damage', 'Other')),
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  attachment_name TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under review', 'in progress', 'resolved', 'rejected', 'closed')),
  assigned_officer TEXT DEFAULT 'Unassigned',
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  trade TEXT DEFAULT 'General',
  duration TEXT DEFAULT '30 mins',
  total_lessons INT DEFAULT 4,
  completed_lessons INT DEFAULT 0,
  progress_pct INT DEFAULT 0,
  badge TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Password Reset Codes Table (Server-side Edge Functions only)
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

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_email_created 
  ON password_reset_codes (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_lookup 
  ON password_reset_codes (email, pin_code, used, expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_codes_token 
  ON password_reset_codes (email, reset_token, token_used, token_expires_at);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_increments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo/application usage
CREATE POLICY "Public read cooperatives" ON cooperatives FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Profiles insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public read workers" ON workers FOR SELECT USING (true);
CREATE POLICY "Workers manage own" ON workers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read households" ON households FOR SELECT USING (true);
CREATE POLICY "Households manage own" ON households FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Jobs viewable by all" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs insertable by all" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Jobs updateable" ON jobs FOR UPDATE USING (true);
CREATE POLICY "Wage ledger viewable" ON wage_ledger FOR SELECT USING (true);
CREATE POLICY "Ratings viewable" ON ratings FOR SELECT USING (true);
CREATE POLICY "Ratings insertable" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "Welfare schemes viewable" ON welfare_schemes FOR SELECT USING (true);
CREATE POLICY "Salaries viewable" ON salaries FOR SELECT USING (true);
CREATE POLICY "Transactions viewable" ON transactions FOR SELECT USING (true);
CREATE POLICY "Complaints viewable" ON complaints FOR SELECT USING (true);
CREATE POLICY "Learning viewable" ON learning_content FOR SELECT USING (true);

-- Restrict password_reset_codes strictly to service_role
REVOKE ALL ON password_reset_codes FROM anon, authenticated;
CREATE POLICY "Service Role Full Access" 
  ON password_reset_codes 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);
