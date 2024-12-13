-- First drop existing tables to start fresh
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;

-- Create chats table first
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_application_id)
);

-- Create chat messages table
CREATE TABLE chat_messages (
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
CREATE OR REPLACE VIEW chat_messages_with_sender AS
SELECT 
  m.*,
  up.full_name as sender_name,
  up.role as sender_role
FROM chat_messages m
JOIN user_profiles up ON up.user_id = m.sender_id;

-- Create indexes
CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chats_business_id ON chats(business_id);
CREATE INDEX idx_chats_freelancer_id ON chats(freelancer_id);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view their chats"
  ON chats FOR SELECT
  USING (auth.uid() = business_id OR auth.uid() = freelancer_id);

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() IN (business_id, freelancer_id));

-- RLS Policies for messages
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

-- Grant permissions
GRANT SELECT ON chat_messages_with_sender TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON chats TO authenticated;