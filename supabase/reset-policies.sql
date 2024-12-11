-- First, drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables first
ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.talent_listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create new policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create new policies for job_listings
CREATE POLICY "Anyone can view job listings"
  ON public.job_listings FOR SELECT
  USING (true);

CREATE POLICY "Business users can create job listings"
  ON public.job_listings FOR INSERT
  WITH CHECK (
    auth.uid() = business_id AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'business'
    )
  );

CREATE POLICY "Business users can update their own job listings"
  ON public.job_listings FOR UPDATE
  USING (auth.uid() = business_id);

CREATE POLICY "Business users can delete their own job listings"
  ON public.job_listings FOR DELETE
  USING (auth.uid() = business_id);

-- Create new policies for talent_listings
CREATE POLICY "Anyone can view talent listings"
  ON public.talent_listings FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can create talent listings"
  ON public.talent_listings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'freelancer'
    )
  );

CREATE POLICY "Freelancers can update their own talent listings"
  ON public.talent_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can delete their own talent listings"
  ON public.talent_listings FOR DELETE
  USING (auth.uid() = user_id);

-- Create new policies for job_applications
CREATE POLICY "Freelancers can create applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can view relevant applications"
  ON public.job_applications FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM public.job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relevant applications"
  ON public.job_applications FOR UPDATE
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM public.job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );

-- Create new policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);