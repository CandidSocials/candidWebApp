-- Drop las tablas existentes si existen
DROP TABLE IF EXISTS chat_messages;

-- Crear nueva tabla de mensajes sin eliminar la anterior
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE DEFAULT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);

-- Deshabilitar RLS temporalmente
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
