-- Create a function to get table information
CREATE OR REPLACE FUNCTION get_table_info(table_name text)
RETURNS TABLE (
    column_name text,
    data_type text,
    is_nullable text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT column_name::text, data_type::text, is_nullable::text
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = $1
    ORDER BY ordinal_position;
$$;
