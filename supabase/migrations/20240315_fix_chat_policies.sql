-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view chat participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can join chat rooms" ON chat_participants;

-- Create new, more specific policies for chat_participants
CREATE POLICY "Users can view participants in their rooms"
  ON chat_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_participants.room_id
      AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms they're invited to"
  ON chat_participants FOR INSERT
  WITH CHECK (
    -- Allow users to join if they're the one being added
    user_id = auth.uid() OR
    -- Or if they're already a participant in the room
    EXISTS (
      SELECT 1 FROM chat_participants cp
      WHERE cp.room_id = chat_participants.room_id
      AND cp.user_id = auth.uid()
    )
  );

-- Update views to be more efficient
CREATE OR REPLACE VIEW chat_rooms_with_participants AS
SELECT 
  cr.*,
  COALESCE(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'user_id', up.user_id,
          'profile', jsonb_build_object(
            'full_name', up.full_name
          )
        )
      )
      FROM chat_participants cp
      JOIN user_profiles up ON up.user_id = cp.user_id
      WHERE cp.room_id = cr.id
    ),
    '[]'::jsonb
  ) as participants
FROM chat_rooms cr;

-- Grant necessary permissions
GRANT SELECT ON chat_rooms_with_participants TO authenticated;
GRANT ALL ON chat_participants TO authenticated;