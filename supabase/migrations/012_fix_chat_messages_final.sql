-- Drop existing views and constraints
DROP VIEW IF EXISTS chat_messages_with_sender;
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey CASCADE;

-- Recreate the chat_messages table with proper relationships
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create a proper view that joins through auth.users to user_profiles
CREATE OR REPLACE VIEW chat_messages_with_sender AS
SELECT 
  m.*,
  up.full_name as sender_full_name
FROM chat_messages m
JOIN user_profiles up ON up.user_id = m.sender_id;

-- Grant necessary permissions
GRANT SELECT ON chat_messages_with_sender TO authenticated;
GRANT ALL ON chat_messages TO authenticated;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_created 
ON chat_messages(chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender 
ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
ON user_profiles(user_id);