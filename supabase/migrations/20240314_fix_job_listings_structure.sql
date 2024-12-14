-- Drop existing job-related tables
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;

-- Create job_listings table
CREATE TABLE job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_applications table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, freelancer_id)
);

-- Create indexes
CREATE INDEX idx_job_listings_business ON job_listings(business_id);
CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_freelancer ON job_applications(freelancer_id);

-- Enable RLS
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view open jobs"
ON job_listings FOR SELECT
TO authenticated
USING (
    status = 'open' OR 
    business_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_applications
        WHERE job_applications.job_id = id
        AND job_applications.freelancer_id = auth.uid()
    )
);

CREATE POLICY "Business can create jobs"
ON job_listings FOR INSERT
TO authenticated
WITH CHECK (business_id = auth.uid());

CREATE POLICY "Business can update own jobs"
ON job_listings FOR UPDATE
TO authenticated
USING (business_id = auth.uid());

CREATE POLICY "Business can delete own jobs"
ON job_listings FOR DELETE
TO authenticated
USING (business_id = auth.uid());

-- RLS Policies for job_applications
CREATE POLICY "Users can view relevant applications"
ON job_applications FOR SELECT
TO authenticated
USING (
    freelancer_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.business_id = auth.uid()
    )
);

CREATE POLICY "Freelancers can create applications"
ON job_applications FOR INSERT
TO authenticated
WITH CHECK (
    freelancer_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.status = 'open'
    )
);

CREATE POLICY "Business can update application status"
ON job_applications FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.business_id = auth.uid()
    )
);
