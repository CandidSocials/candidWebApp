
-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view job listings"
  ON job_listings FOR SELECT
  USING (true);

CREATE POLICY "Business users can create job listings"
  ON job_listings FOR INSERT
  WITH CHECK (
    auth.uid() = business_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'business'
    )
  );

CREATE POLICY "Business users can update their own job listings"
  ON job_listings FOR UPDATE
  USING (auth.uid() = business_id);

CREATE POLICY "Business users can delete their own job listings"
  ON job_listings FOR DELETE
  USING (auth.uid() = business_id);

-- RLS Policies for talent_listings
CREATE POLICY "Anyone can view talent listings"
  ON talent_listings FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can create talent listings"
  ON talent_listings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'freelancer'
    )
  );

CREATE POLICY "Freelancers can update their own talent listings"
  ON talent_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can delete their own talent listings"
  ON talent_listings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for job_applications
CREATE POLICY "Freelancers can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'freelancer'
    )
  );

CREATE POLICY "Users can view relevant applications"
  ON job_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND (
        user_profiles.user_id = job_applications.freelancer_id OR
        EXISTS (
          SELECT 1 FROM job_listings
          WHERE job_listings.id = job_applications.job_id
          AND job_listings.business_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update relevant applications"
  ON job_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND (
        user_profiles.user_id = job_applications.freelancer_id OR
        EXISTS (
          SELECT 1 FROM job_listings
          WHERE job_listings.id = job_applications.job_id
          AND job_listings.business_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);