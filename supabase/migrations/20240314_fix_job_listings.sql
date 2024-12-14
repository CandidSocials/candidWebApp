-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view job listings" ON job_listings;
DROP POLICY IF EXISTS "Business users can create job listings" ON job_listings;
DROP POLICY IF EXISTS "Business users can update their own job listings" ON job_listings;
DROP POLICY IF EXISTS "Business users can delete their own job listings" ON job_listings;
DROP POLICY IF EXISTS "Anyone can view open jobs" ON job_listings;
DROP POLICY IF EXISTS "Business owners can manage their jobs" ON job_listings;

-- Update job_listings table to ensure proper relationships
ALTER TABLE job_listings
DROP CONSTRAINT IF EXISTS job_listings_business_id_fkey,
ADD CONSTRAINT job_listings_business_id_fkey 
  FOREIGN KEY (business_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create new policies
CREATE POLICY "Anyone can view open jobs"
ON job_listings FOR SELECT
USING (
  status = 'open' OR 
  business_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM job_applications
    WHERE job_applications.job_id = job_listings.id
    AND job_applications.freelancer_id = auth.uid()
  )
);

CREATE POLICY "Business users can create job listings"
ON job_listings FOR INSERT
WITH CHECK (
  auth.uid() = business_id AND
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'business'
  )
);

CREATE POLICY "Business users can manage their own listings"
ON job_listings FOR ALL
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_listings_status ON job_listings(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_business_id ON job_listings(business_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_created_at ON job_listings(created_at DESC);
