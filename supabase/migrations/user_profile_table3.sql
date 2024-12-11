-- First, update the job_applications table foreign key
ALTER TABLE job_applications 
DROP CONSTRAINT IF EXISTS job_applications_freelancer_id_fkey,
ADD CONSTRAINT job_applications_freelancer_id_fkey 
  FOREIGN KEY (freelancer_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Recreate the policies with updated rules
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Update job applications policies
DROP POLICY IF EXISTS "Freelancers can create applications" ON job_applications;
DROP POLICY IF EXISTS "Users can view relevant applications" ON job_applications;
DROP POLICY IF EXISTS "Users can update relevant applications" ON job_applications;

CREATE POLICY "Freelancers can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can view relevant applications"
  ON job_applications FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relevant applications"
  ON job_applications FOR UPDATE
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );