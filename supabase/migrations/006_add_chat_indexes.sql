-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_created_at 
ON chat_messages(chat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_recipient 
ON chat_messages(chat_id, sender_id);

CREATE INDEX IF NOT EXISTS idx_chats_participants 
ON chats(business_id, freelancer_id);

CREATE INDEX IF NOT EXISTS idx_chats_job_application 
ON chats(job_application_id);