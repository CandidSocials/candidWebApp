-- 1. Corregir las políticas de job_listings
DROP POLICY IF EXISTS "View jobs" ON job_listings;
DROP POLICY IF EXISTS "Manage own jobs" ON job_listings;

-- Política para ver trabajos
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

-- Separar las políticas de gestión por operación
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

-- 2. Crear una vista para job_listings con user_profiles
CREATE OR REPLACE VIEW job_listings_with_profiles AS
SELECT 
    j.*,
    p.full_name as business_full_name,
    p.company_name as business_company_name
FROM job_listings j
LEFT JOIN user_profiles p ON j.business_id = p.user_id;
