-- Estructura de job_listings
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_listings';

-- Estructura de job_applications
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_applications';

-- Estructura de chat_rooms
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'chat_rooms';

-- Estructura de user_profiles
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- Vista chat_rooms_with_participants
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public'
AND viewname = 'chat_rooms_with_participants';
