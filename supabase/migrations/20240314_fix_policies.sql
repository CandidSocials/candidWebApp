-- Fix job_listings policies
DROP POLICY IF EXISTS "Anyone can view open jobs" ON job_listings;
DROP POLICY IF EXISTS "Business owners can manage their jobs" ON job_listings;

CREATE POLICY "Users can view job listings"
ON job_listings FOR SELECT
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

CREATE POLICY "Business users can manage their listings"
ON job_listings FOR INSERT
TO authenticated
WITH CHECK (business_id = auth.uid());

CREATE POLICY "Business users can update their listings"
ON job_listings FOR UPDATE
TO authenticated
USING (business_id = auth.uid());

CREATE POLICY "Business users can delete their listings"
ON job_listings FOR DELETE
TO authenticated
USING (business_id = auth.uid());

-- Fix chat_participants policies
DROP POLICY IF EXISTS "Users can view room participants" ON chat_participants;
DROP POLICY IF EXISTS "Users can join rooms" ON chat_participants;

CREATE POLICY "View participants in accessible rooms"
ON chat_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM chat_rooms
    WHERE chat_rooms.id = room_id
    AND (
      chat_rooms.created_by = auth.uid() OR
      EXISTS (
        SELECT 1 FROM chat_participants cp
        WHERE cp.room_id = chat_rooms.id
        AND cp.user_id = auth.uid()
      )
    )
  )
);

CREATE POLICY "Join accessible rooms"
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
