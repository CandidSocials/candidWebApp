-- 1. Corregir las políticas de chat_participants
DROP POLICY IF EXISTS "Manage own chat participation" ON chat_participants;
DROP POLICY IF EXISTS "View chat participants" ON chat_participants;

CREATE POLICY "View chat participants"
ON chat_participants FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM chat_rooms cr
        WHERE cr.id = chat_participants.room_id
        AND EXISTS (
            SELECT 1 FROM chat_participants cp2
            WHERE cp2.room_id = cr.id
            AND cp2.user_id = auth.uid()
        )
    )
);

CREATE POLICY "Manage own chat participation"
ON chat_participants FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Crear vista para chat_rooms con participantes
CREATE OR REPLACE VIEW chat_rooms_with_participants AS
SELECT 
    cr.*,
    array_agg(DISTINCT cp.user_id) as participant_ids,
    array_agg(DISTINCT up.full_name) as participant_names
FROM chat_rooms cr
JOIN chat_participants cp ON cr.id = cp.room_id
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
GROUP BY cr.id;

-- 3. Corregir las políticas de job_listings
DROP POLICY IF EXISTS "View jobs" ON job_listings;
DROP POLICY IF EXISTS "Create own jobs" ON job_listings;
DROP POLICY IF EXISTS "Update own jobs" ON job_listings;
DROP POLICY IF EXISTS "Delete own jobs" ON job_listings;

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

-- 4. Crear vista para job_listings con perfiles
CREATE OR REPLACE VIEW job_listings_with_profiles AS
SELECT 
    j.*,
    p.full_name as business_full_name,
    p.company_name as business_company_name
FROM job_listings j
LEFT JOIN user_profiles p ON j.business_id = p.user_id;
