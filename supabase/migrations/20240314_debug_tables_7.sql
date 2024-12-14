-- Estructura de job_applications
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_applications'
ORDER BY ordinal_position;
