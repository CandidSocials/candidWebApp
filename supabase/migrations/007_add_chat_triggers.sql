-- Create function to notify about new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the read status of previous messages in the chat
  UPDATE chat_messages
  SET read = TRUE
  WHERE chat_id = NEW.chat_id
  AND sender_id != NEW.sender_id
  AND read = FALSE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new messages
DROP TRIGGER IF EXISTS on_new_message ON chat_messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();