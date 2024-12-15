-- Drop existing table if exists
DROP TABLE IF EXISTS messages;

-- Create messages table with proper structure
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their messages"
ON messages FOR SELECT
USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
ON messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages"
ON messages FOR UPDATE
USING (auth.uid() IN (sender_id, receiver_id))
WITH CHECK (auth.uid() IN (sender_id, receiver_id));
