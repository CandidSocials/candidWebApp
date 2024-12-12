-- Drop existing view
DROP VIEW IF EXISTS chat_messages_with_sender;

-- Create a materialized view for better performance
CREATE MATERIALIZED VIEW chat_messages_with_sender AS
SELECT 
  m.id,
  m.chat_id,
  m.sender_id,
  m.content,
  m.read,
  m.created_at,
  up.full_name as sender_full_name,
  c.business_id,
  c.freelancer_id
FROM chat_messages m
JOIN chats c ON c.id = m.chat_id
JOIN user_profiles up ON up.user_id = m.sender_id;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON chat_messages_with_sender (id);
CREATE INDEX ON chat_messages_with_sender (chat_id, created_at);
CREATE INDEX ON chat_messages_with_sender (sender_id);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_chat_messages_view()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY chat_messages_with_sender;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the view
CREATE TRIGGER refresh_chat_messages_view
AFTER INSERT OR UPDATE OR DELETE
ON chat_messages
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_chat_messages_view();

-- Grant necessary permissions
GRANT SELECT ON chat_messages_with_sender TO authenticated;
GRANT SELECT ON chat_messages_with_sender TO anon;