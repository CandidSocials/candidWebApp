-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update message read status" ON chat_messages;

-- Add new policy for updating read status
CREATE POLICY "Users can update message read status"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
  )
);

-- Add policy for marking messages as read
CREATE POLICY "Users can mark messages as read"
ON chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
  )
)
WITH CHECK (
  -- Only allow updating the read status
  (OLD.content = NEW.content) AND
  (OLD.sender_id = NEW.sender_id) AND
  (OLD.chat_id = NEW.chat_id)
);