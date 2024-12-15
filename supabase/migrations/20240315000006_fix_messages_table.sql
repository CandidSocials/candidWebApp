-- Drop existing table if it exists
DROP TABLE IF EXISTS messages;

-- Create messages table with correct structure
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Add foreign keys
ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_job_id ON messages(job_id);

-- Add RLS policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages"
    ON messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
    ON messages FOR DELETE
    USING (auth.uid() = sender_id);
