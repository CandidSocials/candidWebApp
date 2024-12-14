-- 1. Primero, eliminar todas las políticas existentes
DROP POLICY IF EXISTS "View open jobs" ON job_listings;
DROP POLICY IF EXISTS "View own business jobs" ON job_listings;
DROP POLICY IF EXISTS "View applied jobs" ON job_listings;
DROP POLICY IF EXISTS "View jobs" ON job_listings;
DROP POLICY IF EXISTS "Create own jobs" ON job_listings;
DROP POLICY IF EXISTS "Update own jobs" ON job_listings;
DROP POLICY IF EXISTS "Delete own jobs" ON job_listings;
DROP POLICY IF EXISTS "Manage own jobs" ON job_listings;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON job_listings;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON job_listings;
DROP POLICY IF EXISTS "Enable update access for users based on email" ON job_listings;
DROP POLICY IF EXISTS "Enable delete access for users based on email" ON job_listings;

DROP POLICY IF EXISTS "View applications" ON job_applications;
DROP POLICY IF EXISTS "View own applications" ON job_applications;
DROP POLICY IF EXISTS "Create own applications" ON job_applications;
DROP POLICY IF EXISTS "Update own applications" ON job_applications;
DROP POLICY IF EXISTS "Delete own applications" ON job_applications;
DROP POLICY IF EXISTS "Manage applications" ON job_applications;
DROP POLICY IF EXISTS "View job applications" ON job_applications;
DROP POLICY IF EXISTS "Create job applications" ON job_applications;
DROP POLICY IF EXISTS "Update job applications" ON job_applications;
DROP POLICY IF EXISTS "Delete job applications" ON job_applications;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON job_applications;
DROP POLICY IF EXISTS "Enable insert access for authenticated users only" ON job_applications;
DROP POLICY IF EXISTS "Enable update access for users based on email" ON job_applications;
DROP POLICY IF EXISTS "Enable delete access for users based on email" ON job_applications;

-- 2. Configurar RLS en ambas tablas
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para job_listings
CREATE POLICY "View jobs"
ON job_listings FOR SELECT
TO authenticated
USING (
    status = 'open' OR 
    business_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_applications
        WHERE job_applications.job_id = job_listings.id
        AND job_applications.freelancer_id = auth.uid()
    )
);

CREATE POLICY "Create own jobs"
ON job_listings FOR INSERT
TO authenticated
WITH CHECK (business_id = auth.uid());

CREATE POLICY "Update own jobs"
ON job_listings FOR UPDATE
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

CREATE POLICY "Delete own jobs"
ON job_listings FOR DELETE
TO authenticated
USING (business_id = auth.uid());

-- 4. Crear políticas para job_applications
CREATE POLICY "View job applications"
ON job_applications FOR SELECT
TO authenticated
USING (
    freelancer_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_applications.job_id
        AND job_listings.business_id = auth.uid()
    )
);

CREATE POLICY "Create job applications"
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

CREATE POLICY "Update job applications"
ON job_applications FOR UPDATE
TO authenticated
USING (
    freelancer_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.business_id = auth.uid()
    )
)
WITH CHECK (
    freelancer_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.business_id = auth.uid()
    )
);

CREATE POLICY "Delete job applications"
ON job_applications FOR DELETE
TO authenticated
USING (
    freelancer_id = auth.uid() AND
    status = 'pending'
);

-- 5. Crear vista para job_listings
DROP VIEW IF EXISTS job_listings_with_profiles;
CREATE VIEW job_listings_with_profiles AS
SELECT 
    j.id,
    j.title,
    j.description,
    j.budget,
    j.location,
    j.category,
    j.skills_required,
    j.status,
    j.created_at,
    j.business_id,
    p.full_name as business_full_name,
    p.company_name as business_company_name
FROM job_listings j
LEFT JOIN user_profiles p ON j.business_id = p.user_id;

-- 6. Otorgar permisos
GRANT SELECT ON job_listings_with_profiles TO authenticated;

-- 7. Verificar foreign keys
ALTER TABLE job_listings
DROP CONSTRAINT IF EXISTS job_listings_business_id_fkey,
ADD CONSTRAINT job_listings_business_id_fkey 
    FOREIGN KEY (business_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;

ALTER TABLE job_applications
DROP CONSTRAINT IF EXISTS job_applications_job_id_fkey,
ADD CONSTRAINT job_applications_job_id_fkey 
    FOREIGN KEY (job_id) 
    REFERENCES job_listings(id) 
    ON DELETE CASCADE;
