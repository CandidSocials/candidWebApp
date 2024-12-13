-- Drop existing views and constraints
DROP VIEW IF EXISTS chat_messages_with_sender CASCADE;
DROP TRIGGER IF EXISTS refresh_chat_messages_view ON chat_messages;
DROP FUNCTION IF EXISTS refresh_chat_messages_view();

-- Recreate chat messages table with proper relationships
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE
);

-- Create view for messages with sender info
CREATE OR REPLACE VIEW chat_messages_with_profiles AS
SELECT 
  m.*,
  up.full_name as sender_name,
  up.role as sender_role
FROM chat_messages m
JOIN user_profiles up ON up.user_id = m.sender_id;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Update RLS policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their chats"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

-- Grant necessary permissions
GRANT SELECT ON chat_messages_with_profiles TO authenticated;
GRANT ALL ON chat_messages TO authenticated;