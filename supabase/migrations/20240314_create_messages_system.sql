-- Drop la vista primero
DROP VIEW IF EXISTS chat_rooms_with_participants;

-- Drop las políticas de chat_rooms
DROP POLICY IF EXISTS "View accessible rooms" ON chat_rooms;
DROP POLICY IF EXISTS "View chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Update chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Delete chat rooms" ON chat_rooms;

-- Drop las políticas de chat_participants
DROP POLICY IF EXISTS "View room participants" ON chat_participants;
DROP POLICY IF EXISTS "Join rooms" ON chat_participants;

-- Drop las tablas en orden correcto
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_participants;
DROP TABLE IF EXISTS chat_rooms;

-- Crear nueva tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES user_profiles(id),
    receiver_id UUID NOT NULL REFERENCES user_profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    CONSTRAINT different_users CHECK (sender_id != receiver_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_messages_job_id ON messages(job_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Políticas de seguridad
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON messages FOR SELECT
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id 
        AND EXISTS (
            SELECT 1 FROM job_listings j
            LEFT JOIN job_applications a ON j.id = a.job_id
            WHERE 
                j.id = messages.job_id 
                AND (
                    -- El business owner puede enviar mensajes a los aplicantes
                    (j.business_id = auth.uid() AND messages.receiver_id IN (
                        SELECT freelancer_id FROM job_applications WHERE job_id = j.id
                    ))
                    OR 
                    -- Los aplicantes pueden enviar mensajes al business owner
                    (auth.uid() IN (
                        SELECT freelancer_id FROM job_applications WHERE job_id = j.id
                    ) AND messages.receiver_id = j.business_id)
                )
        )
    );
