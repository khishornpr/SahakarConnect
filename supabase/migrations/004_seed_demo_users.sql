-- =====================================================================
-- SahakarConnect Demo Users Seed Migration
-- Run this in your Supabase SQL Editor if you want to create the demo
-- users directly inside real Supabase auth.users & public.profiles
-- =====================================================================

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper function to seed or update demo auth user
CREATE OR REPLACE FUNCTION seed_demo_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_role TEXT
) RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO new_id FROM auth.users WHERE email = user_email;
  
  IF new_id IS NULL THEN
    new_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      new_id,
      '00000000-0000-00-00-0000-000000000000',
      user_email,
      crypt(user_password, gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      json_build_object('full_name', user_name, 'role', user_role)::jsonb,
      NOW(),
      NOW(),
      'authenticated',
      'authenticated'
    );
  ELSE
    -- Update password to ensure it matches user_password
    UPDATE auth.users
    SET encrypted_password = crypt(user_password, gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        raw_user_meta_data = json_build_object('full_name', user_name, 'role', user_role)::jsonb
    WHERE id = new_id;
  END IF;

  -- Ensure profile exists in public.profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new_id, user_email, user_name, user_role)
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Worker Demo Account: Ramesh Kumar
SELECT seed_demo_user('ramesh.worker@sahakar.in', 'demo123', 'Ramesh Kumar', 'worker');

-- 2. Household Customer Demo Account: Priya Sharma
SELECT seed_demo_user('priya.customer@sahakar.in', 'demo123', 'Priya Sharma', 'household');

-- 3. Cooperative Admin Demo Account: Meena Iyer
SELECT seed_demo_user('admin@delhicoop.in', 'demo123', 'Meena Iyer', 'cooperative');

-- 4. Zonal Manager Demo Account: Rajiv Deshmukh
SELECT seed_demo_user('manager.delhi@sahakar.in', 'demo123', 'Rajiv Deshmukh', 'manager');

-- 5. Labor Department Officer Demo Account: Sanjay Verma
SELECT seed_demo_user('officer.delhi@gov.in', 'demo123', 'Sanjay Verma', 'officer');
