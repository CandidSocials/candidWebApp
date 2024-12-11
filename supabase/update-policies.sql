-- First drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;

-- Create a new, more permissive insert policy
CREATE POLICY "Enable insert for new users"
  ON public.user_profiles FOR INSERT
  WITH CHECK (
    -- Allow insert for authenticated users creating their own profile
    auth.uid() IS NOT NULL AND
    auth.uid() = user_id
  );

-- Ensure proper permissions are granted
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO service_role;

-- Ensure the sequence permissions are granted
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;