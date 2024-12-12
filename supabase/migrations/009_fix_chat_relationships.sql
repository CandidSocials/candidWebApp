-- Drop existing foreign key constraints
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_chat_id_fkey,
DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_chat_messages_chat_id;
DROP INDEX IF EXISTS idx_chat_messages_sender_id;
DROP INDEX IF EXISTS idx_chat_messages_read;

-- Recreate chat_messages table with proper relationships
ALTER TABLE chat_messages
ADD CONSTRAINT chat_messages_chat_id_fkey 
  FOREIGN KEY (chat_id) 
  REFERENCES chats(id) 
  ON DELETE CASCADE,
ADD CONSTRAINT chat_messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Recreate indexes
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_read ON chat_messages(read);

-- Update the chat messages view to include sender profile
CREATE OR REPLACE VIEW chat_messages_with_sender AS
SELECT 
  cm.*,
  up.full_name as sender_name
FROM chat_messages cm
JOIN user_profiles up ON up.user_id = cm.sender_id;

-- Update policies to use the view
DROP POLICY IF EXISTS "Users can view messages in their chats" ON chat_messages;
CREATE POLICY "Users can view messages in their chats"
ON chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
  )
);