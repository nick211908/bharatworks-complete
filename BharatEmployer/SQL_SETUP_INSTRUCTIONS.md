-- ============================================
-- SUPABASE SETUP: Auto User Creation Trigger
-- ============================================
-- 
-- This file contains the exact SQL to run in Supabase.
-- Copy the ENTIRE content and paste into Supabase SQL Editor, then click RUN.
--
-- What this does:
-- 1. Creates a function that runs when user signs up
-- 2. Automatically creates a public.users record
-- 3. Adds security policies so users see only their data
--
-- ============================================

-- Step 1: Create the trigger function
-- This function runs automatically when auth.users gets a new record

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_roles text[];
  v_phone text;
BEGIN
  -- Get phone from auth metadata
  v_phone := COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'user_phone',
    ''
  );

  -- Get role from metadata, default to 'employer'
  user_roles := ARRAY[COALESCE(
    NEW.raw_user_meta_data->>'role',
    'employer'
  )];

  -- Insert the user into public.users table
  INSERT INTO public.users (id, phone, name, roles, email, created_at)
  VALUES (
    NEW.id,
    v_phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.user_metadata->>'full_name', ''),
    user_roles,
    NEW.email,
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Step 2: Remove old trigger if it exists (safe to run multiple times)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;


-- Step 3: Create the trigger
-- This tells Postgres to run handle_new_user() after each new user signup

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- STEP 4: Add Row Level Security (RLS)
-- This makes sure users can only see their own data
-- ============================================

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own record
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own record
CREATE POLICY "Users can update own record" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow insert during signup (the trigger creates records)
CREATE POLICY "Enable insert for authenticated users during signup" ON public.users
  FOR INSERT WITH CHECK (true);


-- ============================================
-- STEP 5: RLS for employers table
-- ============================================

-- Enable RLS on employers table
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Policy: Employers can read their own record
CREATE POLICY "Employers can read own record" ON public.employers
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own employer profile
CREATE POLICY "Users can create employer profile" ON public.employers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Employers can update their own record
CREATE POLICY "Employers can update own record" ON public.employers
  FOR UPDATE USING (auth.uid() = user_id);


-- ============================================
-- VERIFICATION QUERIES (run these to verify)
-- ============================================

-- Check if trigger function exists
-- SELECT * FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if trigger exists
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check RLS policies on users table
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check RLS policies on employers table
-- SELECT * FROM pg_policies WHERE tablename = 'employers';


-- ============================================
-- TESTING THE SETUP
-- ============================================
-- 
-- 1. Go to your app and sign up with test account
-- 2. Open Supabase Dashboard → Database → SQL Editor
-- 3. Run this query to see if user was created:
--    SELECT id, phone, name, roles, email FROM public.users ORDER BY created_at DESC LIMIT 1;
--
-- 4. Should see your test user in the results!
--
-- ============================================


-- ============================================
-- IF YOU NEED TO UNDO (optional)
-- ============================================
-- 
-- To remove the trigger (if needed):
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
--
-- ============================================
