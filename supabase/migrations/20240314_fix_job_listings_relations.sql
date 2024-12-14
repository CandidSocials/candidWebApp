-- 2. Crear una vista para job_listings con user_profiles
DROP VIEW IF EXISTS job_listings_with_profiles;

CREATE OR REPLACE VIEW job_listings_with_profiles AS
SELECT 
    j.*,
    p.full_name as business_full_name,
    p.company_name as business_company_name
FROM job_listings j
LEFT JOIN user_profiles p ON j.business_id = p.user_id;

-- Agregar relaciones y restricciones de clave foránea
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'job_applications_job_id_fkey' 
               AND table_name = 'job_applications') THEN
        ALTER TABLE job_applications DROP CONSTRAINT job_applications_job_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'job_listings_business_id_fkey' 
               AND table_name = 'job_listings') THEN
        ALTER TABLE job_listings DROP CONSTRAINT job_listings_business_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'job_applications_freelancer_id_fkey' 
               AND table_name = 'job_applications') THEN
        ALTER TABLE job_applications DROP CONSTRAINT job_applications_freelancer_id_fkey;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'job_listings_business_profile_fkey' 
               AND table_name = 'job_listings') THEN
        ALTER TABLE job_listings DROP CONSTRAINT job_listings_business_profile_fkey;
    END IF;
END $$;

-- Add missing columns to job_applications
ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS cover_letter TEXT,
ADD COLUMN IF NOT EXISTS proposed_rate DECIMAL;

-- Add foreign key constraints
ALTER TABLE job_applications
ADD CONSTRAINT job_applications_job_id_fkey 
FOREIGN KEY (job_id) 
REFERENCES job_listings(id)
ON DELETE CASCADE;

ALTER TABLE job_applications
ADD CONSTRAINT job_applications_freelancer_id_fkey 
FOREIGN KEY (freelancer_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE job_listings
ADD CONSTRAINT job_listings_business_id_fkey 
FOREIGN KEY (business_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create foreign key relationship between job_listings and user_profiles
ALTER TABLE job_listings
ADD CONSTRAINT job_listings_business_profile_fkey
FOREIGN KEY (business_id)
REFERENCES user_profiles(user_id)
ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id 
ON job_applications(job_id);

CREATE INDEX IF NOT EXISTS idx_job_applications_freelancer_id 
ON job_applications(freelancer_id);

CREATE INDEX IF NOT EXISTS idx_job_listings_business_id 
ON job_listings(business_id);
