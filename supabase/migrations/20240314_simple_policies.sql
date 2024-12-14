-- Habilitar RLS en las tablas
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (por si acaso)
DROP POLICY IF EXISTS "Enable all for authenticated users" ON job_listings;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON job_applications;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON chat_participants;

-- Crear políticas simples
CREATE POLICY "Enable all for authenticated users"
ON job_listings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users"
ON job_applications FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users"
ON chat_participants FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
