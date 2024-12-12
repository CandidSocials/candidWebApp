-- Drop existing view if exists
DROP VIEW IF EXISTS chat_messages_with_sender;

-- Make sure we have the correct foreign key relationships
ALTER TABLE chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey CASCADE;

-- Add proper foreign key constraint
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create a proper view for messages with sender info
CREATE OR REPLACE VIEW chat_messages_with_sender AS
SELECT 
  m.*,
  jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'role', p.role
  ) as sender_profile
FROM chat_messages m
LEFT JOIN user_profiles p ON p.user_id = m.sender_id;

-- Update the chat messages policy
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
CREATE POLICY "Users can view messages in their chats"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chats c
    WHERE c.id = chat_messages.chat_id
    AND (c.business_id = auth.uid() OR c.freelancer_id = auth.uid())
  )
);

-- Grant necessary permissions
GRANT SELECT ON chat_messages_with_sender TO authenticated;
GRANT ALL ON chat_messages TO authenticated;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_created 
ON chat_messages(chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender 
ON chat_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_read_status 
ON chat_messages(chat_id, read);