-- Drop existing views
DROP VIEW IF EXISTS chat_rooms_with_participants;
DROP VIEW IF EXISTS chat_participants_with_profiles;

-- Create a more efficient view for chat rooms with participants
CREATE OR REPLACE VIEW chat_rooms_with_participants AS
SELECT 
  cr.*,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'user_id', cp.user_id,
        'profile', jsonb_build_object(
          'full_name', up.full_name
        )
      )
    )
    FROM chat_participants cp
    JOIN user_profiles up ON up.user_id = cp.user_id
    WHERE cp.room_id = cr.id
  ) as participants
FROM chat_rooms cr;

-- Create a view for chat participants with profiles
CREATE OR REPLACE VIEW chat_participants_with_profiles AS
SELECT 
  cp.*,
  up.full_name,
  up.role
FROM chat_participants cp
JOIN user_profiles up ON up.user_id = cp.user_id;

-- Grant necessary permissions
GRANT SELECT ON chat_rooms_with_participants TO authenticated;
GRANT SELECT ON chat_participants_with_profiles TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_user 
ON chat_participants(room_id, user_id);

CREATE INDEX IF NOT EXISTS idx_chat_participants_user_room 
ON chat_participants(user_id, room_id);