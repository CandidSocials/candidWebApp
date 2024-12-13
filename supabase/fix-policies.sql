-- First, disable RLS temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for user_profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for new users" ON public.user_profiles;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow insert for authenticated users"
  ON public.user_profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow users to update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO anon;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- The queries below are for table user_presence, which was missing RLS policies

alter table public.user_presence enable row level security;

-- Allow users to read any presence status
create policy "Anyone can view user presence"
on public.user_presence
for select
using (true);

-- Allow users to update their own presence
create policy "Users can update own presence"
on public.user_presence
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Allow users to insert their own presence
create policy "Users can insert own presence"
on public.user_presence
for insert
with check (auth.uid() = user_id);

-- Allow users to delete their own presence
create policy "Users can delete own presence"
on public.user_presence
for delete
using (auth.uid() = user_id);

-- auth fixes below

-- Grant necessary permissions to the authenticator role
GRANT ALL PRIVILEGES ON TABLE public.user_presence TO authenticator;

-- Make sure auth roles can access it
GRANT ALL PRIVILEGES ON TABLE public.user_presence TO anon;
GRANT ALL PRIVILEGES ON TABLE public.user_presence TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.user_presence TO service_role;

-- test again:

DROP TABLE IF EXISTS public.user_presence;

CREATE TABLE public.user_presence (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'offline'::text,
    last_seen timestamptz DEFAULT now(),
    CONSTRAINT user_presence_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_presence_status_check CHECK (status = ANY (ARRAY['online'::text, 'offline'::text, 'away'::text]))
);

-- Set proper ownership
ALTER TABLE public.user_presence OWNER TO postgres;

-- Grant all permissions again
GRANT ALL ON TABLE public.user_presence TO postgres;
GRANT ALL ON TABLE public.user_presence TO anon;
GRANT ALL ON TABLE public.user_presence TO authenticated;
GRANT ALL ON TABLE public.user_presence TO service_role;
GRANT ALL ON TABLE public.user_presence TO authenticator;

-- Enable RLS
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow all access to user_presence"
ON public.user_presence
FOR ALL
USING (true)
WITH CHECK (true);

-- fixed?

-- First, let's create the missing function
CREATE OR REPLACE FUNCTION public.update_user_presence()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_presence (user_id, status, last_seen)
    VALUES (NEW.id, 'offline', now())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the authenticator
GRANT EXECUTE ON FUNCTION public.update_user_presence() TO authenticator;