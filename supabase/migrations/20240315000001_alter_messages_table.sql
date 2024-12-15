-- Modificar la tabla messages para hacer job_id opcional
ALTER TABLE messages ALTER COLUMN job_id DROP NOT NULL;
