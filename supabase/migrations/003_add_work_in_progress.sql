-- Modificar el tipo de estado en job_listings
ALTER TABLE job_listings 
DROP CONSTRAINT IF EXISTS job_listings_status_check;

ALTER TABLE job_listings 
ADD CONSTRAINT job_listings_status_check 
CHECK (status IN ('open', 'closed', 'in_progress'));

-- Agregar índice para búsqueda por estado
CREATE INDEX IF NOT EXISTS idx_job_listings_status 
ON job_listings(status); 