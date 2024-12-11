-- Limpiar datos existentes
TRUNCATE TABLE freelancer_reviews CASCADE;
TRUNCATE TABLE job_applications CASCADE;
TRUNCATE TABLE job_listings CASCADE;
TRUNCATE TABLE talent_listings CASCADE;
TRUNCATE TABLE user_profiles CASCADE;

-- Dar permisos necesarios
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres;

-- Primero, crear los usuarios en auth.users
DO $$
BEGIN
  -- Freelancers
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
  VALUES
    (uuid_generate_v4(), 'ana@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'carlos@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'laura@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'david@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'maria@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    
    -- Business
    (uuid_generate_v4(), 'pedro@techsolutions.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'isabel@designpro.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'miguel@datatech.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'carmen@mobileapp.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
    (uuid_generate_v4(), 'jorge@cloudservices.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

  -- Insertar perfiles usando los IDs generados
  INSERT INTO user_profiles (user_id, role, full_name, bio, skills, location, average_rating, total_reviews, portfolio_items, hourly_rate, availability_status)
  SELECT 
    id,
    'freelancer',
    CASE 
      WHEN email = 'ana@example.com' THEN 'Ana García'
      WHEN email = 'carlos@example.com' THEN 'Carlos Rodríguez'
      WHEN email = 'laura@example.com' THEN 'Laura Martínez'
      WHEN email = 'david@example.com' THEN 'David Sánchez'
      WHEN email = 'maria@example.com' THEN 'María López'
    END,
    'Desarrollador con experiencia',
    ARRAY['React', 'Node.js', 'TypeScript'],
    'Madrid',
    4.8,
    3,
    ARRAY['{"title": "Proyecto Example", "description": "Descripción del proyecto"}'::jsonb],
    45.00,
    'available'
  FROM auth.users
  WHERE email LIKE '%@example.com';

  -- Insertar perfiles de business
  INSERT INTO user_profiles (user_id, role, full_name, company_name, bio, location)
  SELECT 
    id,
    'business',
    CASE 
      WHEN email = 'pedro@techsolutions.com' THEN 'Pedro González'
      WHEN email = 'isabel@designpro.com' THEN 'Isabel Fernández'
      WHEN email = 'miguel@datatech.com' THEN 'Miguel Torres'
      WHEN email = 'carmen@mobileapp.com' THEN 'Carmen Ruiz'
      WHEN email = 'jorge@cloudservices.com' THEN 'Jorge Sánchez'
    END,
    split_part(email, '@', 2),
    'Empresa de tecnología',
    'Madrid'
  FROM auth.users
  WHERE email NOT LIKE '%@example.com';

  -- Insertar job listings
  INSERT INTO job_listings (
    id, 
    business_id, 
    title, 
    description, 
    category, 
    budget, 
    location, 
    skills_required, 
    status,
    company_name
  )
  SELECT 
    uuid_generate_v4(),
    u.id as business_id,
    CASE 
      WHEN u.email = 'pedro@techsolutions.com' THEN 'Desarrollo de App Móvil'
      WHEN u.email = 'isabel@designpro.com' THEN 'Diseño de Marca Corporativa'
      WHEN u.email = 'miguel@datatech.com' THEN 'Arquitectura de Base de Datos'
      WHEN u.email = 'carmen@mobileapp.com' THEN 'Desarrollo Frontend React'
      WHEN u.email = 'jorge@cloudservices.com' THEN 'Implementación DevOps'
    END as title,
    CASE 
      WHEN u.email = 'pedro@techsolutions.com' THEN 'Necesitamos desarrollar una aplicación móvil para iOS y Android'
      WHEN u.email = 'isabel@designpro.com' THEN 'Buscamos diseñador para crear identidad corporativa completa'
      WHEN u.email = 'miguel@datatech.com' THEN 'Diseño e implementación de arquitectura de datos escalable'
      WHEN u.email = 'carmen@mobileapp.com' THEN 'Desarrollo de interfaz de usuario moderna con React'
      WHEN u.email = 'jorge@cloudservices.com' THEN 'Configuración de pipeline CI/CD y infraestructura cloud'
    END as description,
    CASE 
      WHEN u.email = 'pedro@techsolutions.com' THEN 'Mobile Development'
      WHEN u.email = 'isabel@designpro.com' THEN 'Design'
      WHEN u.email = 'miguel@datatech.com' THEN 'Database'
      WHEN u.email = 'carmen@mobileapp.com' THEN 'Frontend'
      WHEN u.email = 'jorge@cloudservices.com' THEN 'DevOps'
    END as category,
    CASE 
      WHEN u.email = 'pedro@techsolutions.com' THEN 5000
      WHEN u.email = 'isabel@designpro.com' THEN 3000
      WHEN u.email = 'miguel@datatech.com' THEN 4000
      WHEN u.email = 'carmen@mobileapp.com' THEN 3500
      WHEN u.email = 'jorge@cloudservices.com' THEN 4500
    END as budget,
    p.location,
    CASE 
      WHEN u.email = 'pedro@techsolutions.com' THEN ARRAY['React Native', 'iOS', 'Android']
      WHEN u.email = 'isabel@designpro.com' THEN ARRAY['Adobe Creative Suite', 'Branding', 'UI Design']
      WHEN u.email = 'miguel@datatech.com' THEN ARRAY['PostgreSQL', 'MongoDB', 'Data Modeling']
      WHEN u.email = 'carmen@mobileapp.com' THEN ARRAY['React', 'TypeScript', 'Tailwind']
      WHEN u.email = 'jorge@cloudservices.com' THEN ARRAY['Docker', 'Kubernetes', 'AWS']
    END as skills_required,
    'open' as status,
    p.company_name
  FROM auth.users u
  JOIN user_profiles p ON u.id = p.user_id
  WHERE u.email NOT LIKE '%@example.com'
  LIMIT 5;

  -- Insertar job applications
  INSERT INTO job_applications (
    job_id,
    freelancer_id,
    cover_letter,
    proposed_rate,
    status,
    freelancer_name
  )
  SELECT 
    j.id,
    f.user_id,
    'Me interesa mucho participar en este proyecto. Tengo experiencia relevante y puedo aportar valor.',
    CASE random()::int % 3
      WHEN 0 THEN 35
      WHEN 1 THEN 45
      WHEN 2 THEN 55
    END,
    CASE random()::int % 3
      WHEN 0 THEN 'pending'
      WHEN 1 THEN 'accepted'
      WHEN 2 THEN 'rejected'
    END,
    f.full_name
  FROM job_listings j
  CROSS JOIN user_profiles f
  WHERE f.role = 'freelancer'
  LIMIT 10;
END $$; 