-- Drop existing policies and views
DROP POLICY IF EXISTS "View chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Update chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Delete chat rooms" ON chat_rooms;

DROP POLICY IF EXISTS "View chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Send messages" ON chat_messages;
DROP POLICY IF EXISTS "Update own messages" ON chat_messages;
DROP POLICY IF EXISTS "Delete own messages" ON chat_messages;

DROP POLICY IF EXISTS "View chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Manage own chat participation" ON chat_participants;

DROP VIEW IF EXISTS chat_rooms_with_participants;

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Add job_id column to chat_rooms if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'chat_rooms' AND column_name = 'job_id') THEN
        ALTER TABLE chat_rooms ADD COLUMN job_id UUID REFERENCES job_listings(id);
    END IF;
END $$;

-- Create view for chat rooms with participants
CREATE VIEW chat_rooms_with_participants AS
SELECT 
    cr.id,
    cr.name,
    cr.created_at,
    cr.updated_at,
    cr.job_id,
    cr.type,
    ARRAY_AGG(
        json_build_object(
            'user_id', cp.user_id,
            'profile', json_build_object(
                'full_name', up.full_name
            )
        )
    ) as participants,
    (
        SELECT json_build_object(
            'id', cm.id,
            'content', cm.content,
            'created_at', cm.created_at,
            'sender_id', cm.sender_id
        )
        FROM chat_messages cm
        WHERE cm.room_id = cr.id
        ORDER BY cm.created_at DESC
        LIMIT 1
    ) as last_message
FROM chat_rooms cr
LEFT JOIN chat_participants cp ON cr.id = cp.room_id
LEFT JOIN user_profiles up ON cp.user_id = up.user_id
GROUP BY cr.id;

-- Chat Rooms Policies
CREATE POLICY "View chat rooms"
ON chat_rooms FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Create chat rooms"
ON chat_rooms FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Update chat rooms"
ON chat_rooms FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = id
        AND chat_participants.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Delete chat rooms"
ON chat_rooms FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = id
        AND chat_participants.user_id = auth.uid()
    )
);

-- Chat Messages Policies
CREATE POLICY "View chat messages"
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
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = room_id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Update own messages"
ON chat_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Delete own messages"
ON chat_messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Chat Participants Policies
CREATE POLICY "View chat participants"
ON chat_participants FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM chat_participants
        WHERE chat_participants.room_id = room_id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Manage own chat participation"
ON chat_participants FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
