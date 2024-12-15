-- Primero hacemos backup de los mensajes existentes
CREATE TABLE IF NOT EXISTS messages_backup AS SELECT * FROM messages;

-- Eliminamos la tabla messages existente
DROP TABLE IF EXISTS messages;

-- Recreamos la tabla messages con las referencias correctas
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    job_id UUID DEFAULT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    CONSTRAINT different_users CHECK (sender_id != receiver_id),
    CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT messages_job_id_fkey FOREIGN KEY (job_id) 
        REFERENCES jobs(id) ON DELETE CASCADE
);

-- Restauramos los mensajes si hay backup
INSERT INTO messages (id, sender_id, receiver_id, job_id, content, created_at, read)
SELECT id, sender_id, receiver_id, job_id, content, created_at, read
FROM messages_backup;

-- Creamos los índices necesarios
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
