-- Eliminar la foreign key redundante
ALTER TABLE job_listings
DROP CONSTRAINT IF EXISTS job_listings_business_profile_fkey;

-- Mantener solo la foreign key a auth.users
ALTER TABLE job_listings
DROP CONSTRAINT IF EXISTS job_listings_business_id_fkey;

ALTER TABLE job_listings
ADD CONSTRAINT job_listings_business_id_fkey 
FOREIGN KEY (business_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;
