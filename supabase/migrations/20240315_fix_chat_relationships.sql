-- First, drop existing foreign key relationships
ALTER TABLE chat_participants DROP CONSTRAINT IF EXISTS chat_participants_user_id_fkey;

-- Add proper foreign key relationships with user_profiles
ALTER TABLE chat_participants
ADD CONSTRAINT chat_participants_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create a view to join chat participants with user profiles
CREATE OR REPLACE VIEW chat_participants_with_profiles AS
SELECT 
  cp.*,
  up.full_name,
  up.role
FROM chat_participants cp
JOIN user_profiles up ON up.user_id = cp.user_id;

-- Grant necessary permissions
GRANT SELECT ON chat_participants_with_profiles TO authenticated;
GRANT ALL ON chat_participants TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_profile 
ON chat_participants(user_id);

-- Update the chat rooms view to include participant information
CREATE OR REPLACE VIEW chat_rooms_with_participants AS
SELECT 
  cr.*,
  jsonb_agg(
    jsonb_build_object(
      'user_id', cp.user_id,
      'profile', jsonb_build_object(
        'full_name', up.full_name
      )
    )
  ) as participants
FROM chat_rooms cr
JOIN chat_participants cp ON cp.room_id = cr.id
JOIN user_profiles up ON up.user_id = cp.user_id
GROUP BY cr.id;

-- Grant permissions for the new view
GRANT SELECT ON chat_rooms_with_participants TO authenticated;