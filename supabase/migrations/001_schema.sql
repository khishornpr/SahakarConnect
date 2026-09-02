-- Financial Analytics & Learning Dashboard - Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker', 'manager', 'owner', 'labor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salaries table
CREATE TABLE salaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Salary increment history
CREATE TABLE salary_increments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  previous_amount DECIMAL(12,2) NOT NULL,
  new_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(12,2) NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under review', 'in progress', 'resolved', 'rejected', 'closed')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Equipment expenses table
CREATE TABLE equipment_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Learning content table
CREATE TABLE learning_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_increments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, managers/owners/labor can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Managers can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'owner', 'labor'))
);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Salaries: workers see own, managers/owners see all
CREATE POLICY "Workers view own salary" ON salaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Managers view all salaries" ON salaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'owner'))
);
CREATE POLICY "Allow salary insert" ON salaries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow salary update" ON salaries FOR UPDATE USING (true);

-- Transactions: workers see own, managers/owners see all
CREATE POLICY "Workers view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Managers view all transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'owner'))
);
CREATE POLICY "Allow transaction insert" ON transactions FOR INSERT WITH CHECK (true);

-- Complaints: workers see own, managers/labor/owners see all
CREATE POLICY "Workers view own complaints" ON complaints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Staff view all complaints" ON complaints FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'owner', 'labor'))
);
CREATE POLICY "Workers can create complaints" ON complaints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Labor can update complaints" ON complaints FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('labor', 'manager'))
);

-- Equipment expenses: owners can manage
CREATE POLICY "Owners view expenses" ON equipment_expenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);
CREATE POLICY "Owners insert expenses" ON equipment_expenses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
);

-- Learning content: assigned workers and managers can view
CREATE POLICY "View assigned learning" ON learning_content FOR SELECT USING (
  assigned_to = auth.uid() OR assigned_to IS NULL OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'owner'))
);
CREATE POLICY "Insert learning content" ON learning_content FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'owner'))
);

-- Auto-create profile on signup (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), COALESCE(NEW.raw_user_meta_data->>'role', 'worker'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The app handles profile creation in the signUp function instead of this trigger.
-- You can use either approach. If using the trigger, remove the profile insert from AuthContext.
