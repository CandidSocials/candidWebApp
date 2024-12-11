-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('business', 'freelancer')),
  full_name TEXT,
  company_name TEXT,
  bio TEXT,
  skills TEXT[],
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Create job_listings table
CREATE TABLE job_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  skills_required TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create talent_listings table
CREATE TABLE talent_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create job_applications table
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE NOT NULL,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cover_letter TEXT NOT NULL,
  proposed_rate DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- RLS Policies for user_profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for job_listings
CREATE POLICY "Anyone can view job listings"
  ON job_listings FOR SELECT
  USING (true);

CREATE POLICY "Business users can create job listings"
  ON job_listings FOR INSERT
  WITH CHECK (auth.uid() = business_id);

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
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can update their own talent listings"
  ON talent_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can delete their own talent listings"
  ON talent_listings FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for job_applications
CREATE POLICY "Freelancers can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Users can view relevant applications"
  ON job_applications FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
    )
  );

CREATE POLICY "Users can update relevant applications"
  ON job_applications FOR UPDATE
  USING (
    auth.uid() = freelancer_id OR
    EXISTS (
      SELECT 1 FROM job_listings
      WHERE job_listings.id = job_applications.job_id
      AND job_listings.business_id = auth.uid()
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