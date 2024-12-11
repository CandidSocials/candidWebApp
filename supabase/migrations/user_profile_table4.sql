-- First, ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Create more permissive policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON public.user_profiles FOR INSERT
  WITH CHECK (
    -- Allow insert if the user is authenticated and is creating their own profile
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

CREATE POLICY "Enable update for users based on user_id"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Ensure the auth.users table has RLS enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;