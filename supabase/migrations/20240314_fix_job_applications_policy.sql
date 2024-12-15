-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can create their own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON job_applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON job_applications;

-- Habilitar RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Política para ver aplicaciones (como freelancer o dueño del trabajo)
CREATE POLICY "Users can view applications"
ON job_applications FOR SELECT
TO authenticated
USING (
  freelancer_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM job_listings 
    WHERE id = job_applications.job_id 
    AND business_id = auth.uid()
  )
);

-- Política para crear aplicaciones
CREATE POLICY "Users can create applications"
ON job_applications FOR INSERT
TO authenticated
WITH CHECK (
  freelancer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM job_listings 
    WHERE id = job_id 
    AND status = 'open'
  )
);

-- Política para actualizar aplicaciones propias
CREATE POLICY "Users can update own applications"
ON job_applications FOR UPDATE
TO authenticated
USING (freelancer_id = auth.uid())
WITH CHECK (freelancer_id = auth.uid());

-- Política para eliminar aplicaciones propias
CREATE POLICY "Users can delete own applications"
ON job_applications FOR DELETE
TO authenticated
USING (freelancer_id = auth.uid());
