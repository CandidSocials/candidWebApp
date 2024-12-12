-- Add read status to chat messages
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- Create index for read status queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_read 
ON chat_messages(read);

-- Update existing messages to be marked as read
UPDATE chat_messages SET read = TRUE;