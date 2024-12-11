-- Insertar reseñas
INSERT INTO freelancer_reviews (freelancer_id, business_id, rating, comment)
SELECT 
  f.user_id as freelancer_id,
  b.user_id as business_id,
  5,
  'Excelente trabajo'
FROM user_profiles f
CROSS JOIN user_profiles b
WHERE f.role = 'freelancer'
AND b.role = 'business'
LIMIT 5;

-- Insertar talent listings
INSERT INTO talent_listings (user_id, title, description, category, hourly_rate, location, skills, user_email)
SELECT
  user_id,
  'Desarrollador Full Stack',
  'Especializado en desarrollo web moderno',
  'Development',
  hourly_rate,
  location,
  skills,
  'contact@example.com'
FROM user_profiles
WHERE role = 'freelancer'; 