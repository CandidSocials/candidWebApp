-- Todas las tablas y vistas relevantes
WITH table_info AS (
    SELECT 
        table_name,
        column_name,
        data_type,
        column_default,
        is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'job_listings',
        'job_applications',
        'chat_rooms',
        'chat_participants',
        'user_profiles'
    )
)
SELECT json_agg(
    json_build_object(
        'table', table_name,
        'column', column_name,
        'type', data_type,
        'default', column_default,
        'nullable', is_nullable
    ) ORDER BY table_name, column_name
) as table_info;

-- Vista chat_rooms_with_participants
SELECT json_build_object(
    'view_name', viewname,
    'definition', definition
) as view_info
FROM pg_views
WHERE schemaname = 'public'
AND viewname = 'chat_rooms_with_participants';
