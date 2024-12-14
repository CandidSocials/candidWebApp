-- Reset policies
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own chats" ON chats;
DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view job listings" ON job_listings;
DROP POLICY IF EXISTS "Users can view job applications" ON job_applications;
DROP POLICY IF EXISTS "Business owners can manage their job listings" ON job_listings;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Enable read access for all users"
ON user_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Chat policies
CREATE POLICY "Users can view their own chats"
ON chats
FOR ALL
TO authenticated
USING (
  auth.uid() = business_id OR 
  auth.uid() = freelancer_id
);

-- Chat messages policies
CREATE POLICY "Users can view chat messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
  )
);

CREATE POLICY "Users can insert chat messages"
ON chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM chats
    WHERE chats.id = chat_messages.chat_id
    AND (chats.business_id = auth.uid() OR chats.freelancer_id = auth.uid())
  )
);

-- Job listings policies
CREATE POLICY "Anyone can view open jobs"
ON job_listings
FOR SELECT
TO authenticated
USING (
  status = 'open' OR 
  business_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM job_applications
    WHERE job_applications.job_id = job_listings.id
    AND job_applications.freelancer_id = auth.uid()
  )
);

CREATE POLICY "Business owners can manage their jobs"
ON job_listings
FOR ALL 
TO authenticated
USING (business_id = auth.uid())
WITH CHECK (business_id = auth.uid());

-- Job applications policies
CREATE POLICY "Users can view relevant applications"
ON job_applications
FOR SELECT
TO authenticated
USING (
  freelancer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_applications.job_id
    AND job_listings.business_id = auth.uid()
  )
);

CREATE POLICY "Freelancers can create applications"
ON job_applications
FOR INSERT
TO authenticated
WITH CHECK (
  freelancer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM job_listings
    WHERE job_listings.id = job_id
    AND job_listings.status = 'open'
  )
);

-- Grant necessary permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON chats TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON job_listings TO authenticated;
GRANT ALL ON job_applications TO authenticated;
