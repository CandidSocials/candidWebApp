-- 1. Respaldamos los datos existentes
CREATE TABLE IF NOT EXISTS old_chats AS SELECT * FROM chats;
CREATE TABLE IF NOT EXISTS old_chat_messages AS SELECT * FROM chat_messages;

-- 2. Eliminamos las políticas existentes
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view room participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can view their rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;

-- 3. Eliminamos las tablas antiguas
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS chats CASCADE;

-- 4. Creamos el nuevo sistema unificado
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    type TEXT CHECK (type IN ('direct', 'group', 'job')) NOT NULL,
    job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_participants (
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    read BOOLEAN DEFAULT FALSE
);

-- 5. Creamos los índices necesarios
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX idx_chat_rooms_job_application ON chat_rooms(job_application_id) WHERE job_application_id IS NOT NULL;

-- 6. Habilitamos RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. Creamos las políticas RLS
-- Para chat_rooms
CREATE POLICY "View accessible rooms"
ON chat_rooms FOR SELECT
TO authenticated
USING (
    created_by = auth.uid() OR
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Create rooms"
ON chat_rooms FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Para chat_participants
CREATE POLICY "View room participants"
ON chat_participants FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM chat_rooms
        WHERE chat_rooms.id = room_id
        AND chat_rooms.created_by = auth.uid()
    )
);

CREATE POLICY "Join rooms"
ON chat_participants FOR INSERT
TO authenticated
WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM chat_rooms
        WHERE chat_rooms.id = room_id
        AND chat_rooms.created_by = auth.uid()
    )
);

-- Para chat_messages
CREATE POLICY "View room messages"
ON chat_messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = room_id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Send messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = room_id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Update own messages"
ON chat_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

-- 8. Migramos los datos antiguos
INSERT INTO chat_rooms (id, name, type, job_application_id, created_by, created_at, updated_at)
SELECT 
    id,
    COALESCE('Chat for Job Application ' || job_application_id::text, 'Direct Chat'),
    CASE 
        WHEN job_application_id IS NOT NULL THEN 'job'
        ELSE 'direct'
    END,
    job_application_id,
    business_id,
    created_at,
    updated_at
FROM old_chats;

INSERT INTO chat_participants (room_id, user_id, joined_at, last_read_at)
SELECT 
    id as room_id,
    business_id as user_id,
    created_at as joined_at,
    updated_at as last_read_at
FROM old_chats
UNION
SELECT 
    id as room_id,
    freelancer_id as user_id,
    created_at as joined_at,
    updated_at as last_read_at
FROM old_chats;

INSERT INTO chat_messages (id, room_id, sender_id, content, created_at, updated_at, is_edited, read)
SELECT 
    id,
    chat_id as room_id,
    sender_id,
    content,
    created_at,
    updated_at,
    is_edited,
    read
FROM old_chat_messages;
