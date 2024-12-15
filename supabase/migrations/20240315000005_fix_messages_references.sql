-- Primero, eliminamos los mensajes que referencian usuarios que no existen
DELETE FROM messages 
WHERE sender_id NOT IN (SELECT id FROM auth.users)
   OR receiver_id NOT IN (SELECT id FROM auth.users);

-- Drop existing foreign keys
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Add new foreign keys that reference auth.users directly
ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;
