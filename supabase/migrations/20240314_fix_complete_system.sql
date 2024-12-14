-- 1. Respaldamos todos los datos existentes
CREATE TABLE IF NOT EXISTS old_chats AS SELECT * FROM chats;
CREATE TABLE IF NOT EXISTS old_chat_messages AS SELECT * FROM chat_messages;
CREATE TABLE IF NOT EXISTS old_job_listings AS SELECT * FROM job_listings;
CREATE TABLE IF NOT EXISTS old_job_applications AS SELECT * FROM job_applications;

-- 2. Eliminamos las políticas existentes
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view room participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can view their rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Anyone can view open jobs" ON job_listings;
DROP POLICY IF EXISTS "Business owners can manage their jobs" ON job_listings;

-- 3. Eliminamos las tablas en orden correcto
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS job_listings CASCADE;

-- 4. Creamos las tablas en orden correcto
CREATE TABLE job_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    skills_required TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')) DEFAULT 'open',
    business_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proposal TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_id, freelancer_id)
);

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

-- 5. Creamos los índices
CREATE INDEX idx_job_listings_business ON job_listings(business_id);
CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_freelancer ON job_applications(freelancer_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX idx_chat_rooms_job_application ON chat_rooms(job_application_id) WHERE job_application_id IS NOT NULL;

-- 6. Habilitamos RLS
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. Creamos las políticas RLS
-- Para job_listings
CREATE POLICY "View jobs"
ON job_listings FOR SELECT
TO authenticated
USING (
    status = 'open' OR 
    business_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_applications
        WHERE job_applications.job_id = id
        AND job_applications.freelancer_id = auth.uid()
    )
);

CREATE POLICY "Manage own jobs"
ON job_listings FOR ALL
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

-- Para job_applications
CREATE POLICY "View applications"
ON job_applications FOR SELECT
TO authenticated
USING (
    freelancer_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.business_id = auth.uid()
    )
);

CREATE POLICY "Create applications"
ON job_applications FOR INSERT
TO authenticated
WITH CHECK (
    freelancer_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM job_listings
        WHERE job_listings.id = job_id
        AND job_listings.status = 'open'
    )
);

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

-- 8. Migramos los datos en orden
-- Primero job_listings y job_applications si existen datos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM old_job_listings) THEN
        INSERT INTO job_listings 
        SELECT * FROM old_job_listings;
        
        INSERT INTO job_applications 
        SELECT * FROM old_job_applications;
    END IF;
END $$;

-- Luego migramos los chats
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM old_chats) THEN
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
        FROM old_chats
        WHERE NOT EXISTS (
            SELECT 1 FROM old_chats oc
            WHERE oc.job_application_id IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM job_applications ja
                WHERE ja.id = oc.job_application_id
            )
        );

        INSERT INTO chat_participants (room_id, user_id, joined_at, last_read_at)
        SELECT DISTINCT
            c.id as room_id,
            business_id as user_id,
            c.created_at as joined_at,
            c.updated_at as last_read_at
        FROM old_chats c
        JOIN chat_rooms cr ON c.id = cr.id
        UNION
        SELECT DISTINCT
            c.id as room_id,
            freelancer_id as user_id,
            c.created_at as joined_at,
            c.updated_at as last_read_at
        FROM old_chats c
        JOIN chat_rooms cr ON c.id = cr.id;

        INSERT INTO chat_messages (id, room_id, sender_id, content, created_at, updated_at, is_edited, read)
        SELECT 
            m.id,
            m.chat_id as room_id,
            m.sender_id,
            m.content,
            m.created_at,
            m.updated_at,
            m.is_edited,
            m.read
        FROM old_chat_messages m
        JOIN chat_rooms cr ON m.chat_id = cr.id;
    END IF;
END $$;
