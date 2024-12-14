-- 1. Estructura de job_listings
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'job_listings'
ORDER BY ordinal_position;

-- 2. Foreign keys de job_listings
SELECT
    tc.constraint_name,
    kcu.column_name as fk_column,
    ccu.table_name as referenced_table,
    ccu.column_name as referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'job_listings'
    AND tc.constraint_type = 'FOREIGN KEY';

-- 3. Políticas RLS actuales de job_listings
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'job_listings';

-- 4. Estructura de chat_participants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'chat_participants'
ORDER BY ordinal_position;

-- 5. Políticas RLS actuales de chat_participants
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'chat_participants';

-- 6. Verificar si hay tablas duplicadas o viejas
SELECT 
    table_name,
    string_agg(column_name, ', ') as columns
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('chats', 'chat_rooms', 'chat_messages', 'chat_participants')
GROUP BY table_name;
