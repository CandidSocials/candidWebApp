-- Create reviews table
CREATE TABLE freelancer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(freelancer_id, business_id)
);

-- Update user_profiles table
ALTER TABLE user_profiles
ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0,
ADD COLUMN total_reviews INTEGER DEFAULT 0,
ADD COLUMN portfolio_items JSONB[] DEFAULT ARRAY[]::JSONB[],
ADD COLUMN hourly_rate DECIMAL(10,2),
ADD COLUMN availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'unavailable')) DEFAULT 'available';

-- RLS policies for reviews
ALTER TABLE freelancer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews visible to everyone"
  ON freelancer_reviews FOR SELECT
  USING (true);

CREATE POLICY "Only businesses can create reviews"
  ON freelancer_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
      AND role = 'business'
    )
  );

CREATE POLICY "Only author can update their review"
  ON freelancer_reviews FOR UPDATE
  USING (business_id = auth.uid()); 