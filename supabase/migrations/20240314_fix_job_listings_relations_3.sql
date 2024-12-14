-- Agregar foreign key de job_listings a user_profiles
ALTER TABLE job_listings
ADD CONSTRAINT job_listings_business_profile_fkey 
FOREIGN KEY (business_id) 
REFERENCES user_profiles(user_id)
ON DELETE CASCADE;
