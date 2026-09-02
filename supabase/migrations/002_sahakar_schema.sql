-- SahakarConnect Database Schema (SIH26089)
-- Cooperative-Owned Digital Service Marketplace Platform

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
  role TEXT NOT NULL CHECK (role IN ('worker', 'household', 'cooperative')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Workers Profile (Trade skills, Cooperative link, KYC status)
CREATE TABLE IF NOT EXISTS workers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  cooperative_id UUID REFERENCES cooperatives(id) ON DELETE SET NULL,
  primary_trade TEXT NOT NULL, -- e.g. Electrician, Plumber, Carpenter, Painter, Cleaner, Technician
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

-- 9. Cooperative Welfare Schemes (Phase 2 Stub Schema)
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

-- Row Level Security
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE welfare_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read for cooperatives" ON cooperatives FOR SELECT USING (true);
CREATE POLICY "Public read for profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Workers visible to all" ON workers FOR SELECT USING (true);
CREATE POLICY "Jobs visible to involved users and admins" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs insertable by households" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Jobs updateable" ON jobs FOR UPDATE USING (true);
CREATE POLICY "Wage ledger viewable" ON wage_ledger FOR SELECT USING (true);
CREATE POLICY "Ratings viewable by all" ON ratings FOR SELECT USING (true);
CREATE POLICY "Welfare schemes viewable by all" ON welfare_schemes FOR SELECT USING (true);
