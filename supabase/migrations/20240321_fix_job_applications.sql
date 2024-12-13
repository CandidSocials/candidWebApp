-- Drop existing foreign key constraints
ALTER TABLE job_applications 
DROP CONSTRAINT IF EXISTS job_applications_freelancer_id_fkey CASCADE;

-- Recreate job_applications table with proper relationships
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT NOT NULL,
  proposed_rate DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create view for job applications with freelancer info
CREATE OR REPLACE VIEW job_applications_with_profiles AS
SELECT 
  ja.*,
  up.full_name as freelancer_name,
  j.title as job_title,
  j.business_id as business_id
FROM job_applications ja
JOIN user_profiles up ON up.user_id = ja.freelancer_id
JOIN job_listings j ON j.id = ja.job_id;

-- Create indexes
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_freelancer_id ON job_applications(freelancer_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their applications"
  ON job_applications FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can update their applications"
  ON job_applications FOR UPDATE
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT ON job_applications_with_profiles TO authenticated;
GRANT ALL ON job_applications TO authenticated;