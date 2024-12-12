-- Drop existing materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS chat_messages_with_sender CASCADE;
DROP TRIGGER IF EXISTS refresh_chat_messages_view ON chat_messages;
DROP FUNCTION IF EXISTS refresh_chat_messages_view();

-- Ensure proper table structure
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(job_application_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create a regular view instead of materialized view for real-time updates
CREATE OR REPLACE VIEW chat_messages_with_sender AS
SELECT 
  m.id,
  m.chat_id,
  m.sender_id,
  m.content,
  m.read,
  m.created_at,
  up.full_name as sender_full_name
FROM chat_messages m
JOIN user_profiles up ON up.user_id = m.sender_id;

-- Create necessary indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);
CREATE INDEX IF NOT EXISTS idx_chats_business_id ON chats(business_id);
CREATE INDEX IF NOT EXISTS idx_chats_freelancer_id ON chats(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_chats_job_application_id ON chats(job_application_id);

-- Update RLS policies
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for chats
CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (auth.uid() = business_id OR auth.uid() = freelancer_id);

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() IN (business_id, freelancer_id));

-- Policies for messages
CREATE POLICY "Users can view messages in their chats"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Users can update message read status"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
    )
  );

-- Grant necessary permissions
GRANT SELECT ON chat_messages_with_sender TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON chats TO authenticated;