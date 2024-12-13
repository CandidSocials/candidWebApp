-- Drop existing views
DROP VIEW IF EXISTS chat_messages_with_sender;
DROP VIEW IF EXISTS chat_messages_with_profiles;

-- Create a more efficient view for messages with profiles
CREATE OR REPLACE VIEW chat_messages_with_profiles AS
SELECT 
  m.*,
  up.full_name as sender_name,
  up.role as sender_role,
  c.business_id,
  c.freelancer_id,
  c.job_application_id
FROM chat_messages m
JOIN chats c ON c.id = m.chat_id
JOIN user_profiles up ON up.user_id = m.sender_id;

-- Create a view for chat rooms with participant info
CREATE OR REPLACE VIEW chat_rooms_with_details AS
SELECT 
  c.*,
  b.full_name as business_name,
  f.full_name as freelancer_name,
  j.title as job_title
FROM chats c
JOIN user_profiles b ON b.user_id = c.business_id
JOIN user_profiles f ON f.user_id = c.freelancer_id
JOIN job_applications ja ON ja.id = c.job_application_id
JOIN job_listings j ON j.id = ja.job_id;

-- Grant permissions
GRANT SELECT ON chat_messages_with_profiles TO authenticated;
GRANT SELECT ON chat_rooms_with_details TO authenticated;