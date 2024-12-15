-- Primero eliminamos las foreign keys existentes
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Asegurarnos que estamos en el esquema correcto
SET search_path TO public, auth;

-- Luego agregamos las foreign keys correctas a auth.users
ALTER TABLE messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) 
  REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verificar que las foreign keys se crearon correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey'
    AND constraint_schema = 'public'
  ) THEN
    RAISE EXCEPTION 'Foreign key messages_sender_id_fkey was not created correctly';
  END IF;
END $$;
