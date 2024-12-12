-- First, drop existing views and constraints
DROP VIEW IF EXISTS chat_messages_with_sender;
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey CASCADE;

-- Recreate the chat_messages table with proper relationships
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create a view that includes the sender's profile information
CREATE OR REPLACE VIEW chat_messages_with_sender AS
SELECT 
  m.*,
  jsonb_build_object(
    'profile', jsonb_build_object(
      'full_name', p.full_name
    )
  ) as sender
FROM chat_messages m
JOIN user_profiles p ON p.user_id = m.sender_id;

-- Grant necessary permissions
GRANT SELECT ON chat_messages_with_sender TO authenticated;
GRANT SELECT ON chat_messages_with_sender TO anon;

-- Update the chat messages policy to use proper joins
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_profile 
ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_sender 
ON chat_messages(chat_id, sender_id);