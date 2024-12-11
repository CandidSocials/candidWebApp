-- Esquema de tablas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario
CREATE TABLE user_profiles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('freelancer', 'business')),
  full_name TEXT NOT NULL,
  company_name TEXT,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  location TEXT,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  portfolio_items JSONB[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reseñas
CREATE TABLE freelancer_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES user_profiles(user_id),
  business_id UUID REFERENCES user_profiles(user_id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de listings de talento
CREATE TABLE talent_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(user_id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  hourly_rate DECIMAL(10,2),
  location TEXT,
  skills TEXT[],
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar índices para mejor rendimiento
CREATE INDEX idx_job_listings_business_id ON job_listings(business_id);
CREATE INDEX idx_job_listings_status ON job_listings(status);
CREATE INDEX idx_job_listings_created_at ON job_listings(created_at);

-- Políticas RLS para job_listings
CREATE POLICY "Anyone can read job listings" ON job_listings
  FOR SELECT USING (true);

CREATE POLICY "Business owners can create listings" ON job_listings
  FOR INSERT WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Business owners can update their listings" ON job_listings
  FOR UPDATE USING (auth.uid() = business_id); 