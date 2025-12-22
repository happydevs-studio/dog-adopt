-- Seed file for LOCAL DEVELOPMENT ONLY
-- This file is ONLY run by `supabase db reset` in local development
-- It will NOT be applied to production databases

-- Pre-configured admin account for easy local development access
-- 
-- Login Credentials:
--   Email:    admin@test.com
--   Password: admin123
--
-- Use these credentials to sign in at /auth and access the admin panel
-- 
-- Note: You can remove this entire file if you prefer to manually 
-- promote users to admin via SQL commands

INSERT INTO auth.users (
  id, 
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  email_change_token_current,
  email_change_token_new
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'admin@test.com',
  -- Password hash for: admin123
  '$2a$10$kLZKrPLdLMhXPHEyMXHpZO7L5YQxKDgXL0pVZ7fN3kZCrfPaZQJf6',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at;

-- Override the default 'user' role to make this account an admin
DELETE FROM dogadopt.user_roles WHERE user_id = '00000000-0000-0000-0000-000000000001';
INSERT INTO dogadopt.user_roles (user_id, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin');
