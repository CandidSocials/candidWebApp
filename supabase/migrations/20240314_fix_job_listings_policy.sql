-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anyone can view jobs" ON job_listings;
DROP POLICY IF EXISTS "Users can create their own jobs" ON job_listings;
DROP POLICY IF EXISTS "Users can update their own jobs" ON job_listings;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON job_listings;

-- Habilitar RLS
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Política básica para ver trabajos
CREATE POLICY "Anyone can view jobs"
ON job_listings FOR SELECT
USING (true);

-- Política básica para gestionar trabajos propios
CREATE POLICY "Users can manage their own jobs"
ON job_listings FOR INSERT
TO authenticated
WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can update their own jobs"
ON job_listings FOR UPDATE
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

CREATE POLICY "Users can delete their own jobs"
ON job_listings FOR DELETE
TO authenticated
USING (business_id = auth.uid());
