-- Estructura detallada de job_listings
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_listings'
ORDER BY ordinal_position;

-- Estructura detallada de job_applications
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_applications'
ORDER BY ordinal_position;

-- Estructura detallada de chat_rooms_with_participants
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname = 'chat_rooms_with_participants';

-- Estructura detallada de chat_participants
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_participants'
ORDER BY ordinal_position;
