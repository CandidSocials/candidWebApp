create table talent_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text not null,
  category text not null,
  hourly_rate numeric not null,
  location text not null,
  skills text[] not null,
  user_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table talent_listings enable row level security;

-- Create policies
create policy "Users can create their own listings" on talent_listings
  for insert with check (auth.uid() = user_id);

create policy "Listings are viewable by everyone" on talent_listings
  for select using (true);

create policy "Users can update their own listings" on talent_listings
  for update using (auth.uid() = user_id);

create policy "Users can delete their own listings" on talent_listings
  for delete using (auth.uid() = user_id);