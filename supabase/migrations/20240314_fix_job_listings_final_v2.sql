-- 1. Asegurarnos de que la tabla job_listings tiene enable_row_level_security
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes
DROP POLICY IF EXISTS "View jobs" ON job_listings;
DROP POLICY IF EXISTS "Create own jobs" ON job_listings;
DROP POLICY IF EXISTS "Update own jobs" ON job_listings;
DROP POLICY IF EXISTS "Delete own jobs" ON job_listings;

-- 3. Crear nuevas políticas más simples
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

-- 4. Crear o actualizar la vista
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

-- 5. Otorgar permisos a la vista
GRANT SELECT ON job_listings_with_profiles TO authenticated;

-- 6. Verificar que no hay problemas con las foreign keys
ALTER TABLE job_listings
DROP CONSTRAINT IF EXISTS job_listings_business_id_fkey,
ADD CONSTRAINT job_listings_business_id_fkey 
    FOREIGN KEY (business_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE;
