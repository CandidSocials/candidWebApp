-- Create user profiles table
create table user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  role text not null check (role in ('business', 'freelancer')),
  company_name text,
  full_name text not null,
  bio text,
  skills text[],
  location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create job listings table
create table job_listings (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references auth.users not null,
  title text not null,
  description text not null,
  category text not null,
  budget numeric not null,
  location text not null,
  skills_required text[] not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_name text
);

-- Create job applications table
create table job_applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references job_listings not null,
  freelancer_id uuid references auth.users not null,
  cover_letter text not null,
  proposed_rate numeric not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  freelancer_name text,
  unique(job_id, freelancer_id)
);

-- Enable RLS
alter table user_profiles enable row level security;
alter table job_listings enable row level security;
alter table job_applications enable row level security;

-- RLS policies for user_profiles
create policy "Users can read all profiles" on user_profiles
  for select using (true);

create policy "Users can create their own profile" on user_profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on user_profiles
  for update using (auth.uid() = user_id);

-- RLS policies for job_listings
create policy "Anyone can read job listings" on job_listings
  for select using (true);

create policy "Business owners can create listings" on job_listings
  for insert with check (
    auth.uid() = business_id and
    exists (
      select 1 from user_profiles
      where user_id = auth.uid()
      and role = 'business'
    )
  );

create policy "Business owners can update their listings" on job_listings
  for update using (auth.uid() = business_id);

-- RLS policies for job_applications
create policy "Freelancers can create applications" on job_applications
  for insert with check (
    auth.uid() = freelancer_id and
    exists (
      select 1 from user_profiles
      where user_id = auth.uid()
      and role = 'freelancer'
    )
  );

create policy "Users can read their own applications" on job_applications
  for select using (
    auth.uid() = freelancer_id or
    auth.uid() in (
      select business_id from job_listings
      where id = job_applications.job_id
    )
  );

create policy "Business owners can update application status" on job_applications
  for update using (
    auth.uid() in (
      select business_id from job_listings
      where id = job_applications.job_id
    )
  );