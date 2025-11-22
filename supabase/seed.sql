-- Create a dummy host user (This might fail if auth.users is locked down, but worth a try for seeding)
-- We use a fixed UUID for the host to link venues easily
DO $$
DECLARE
  host_uid uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Try to insert into auth.users if possible, otherwise we might need to manually create a user
  -- Note: Direct insertion into auth.users is often restricted. 
  -- If this fails, we might need to rely on the user creating an account and then updating the venues.
  -- For now, we will assume we can insert into profiles and maybe the FK will be an issue.
  -- actually, let's just insert into profiles and hope the FK check is deferred or we are superuser.
  -- If we are superuser, we can insert into auth.users.
  
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', host_uid, 'authenticated', 'authenticated', 'host@ocasion.com', 'password', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (host_uid, 'host@ocasion.com', 'Ocasion Host', 'host')
  ON CONFLICT (id) DO NOTHING;

  -- Venue 1: Rooftop Vila Olímpia
  INSERT INTO public.venues (id, host_id, title, description, slug, address_street, address_neighborhood, max_capacity_seated, max_capacity_standing, amenities, images)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    host_uid,
    'Rooftop Vila Olímpia',
    'Vista incrível para a cidade, perfeito para happy hours e eventos corporativos descontraídos.',
    'rooftop-vila-olimpia',
    'Rua Gomes de Carvalho, 1000',
    'Vila Olímpia',
    50,
    100,
    '["wifi", "bar", "som", "ar_condicionado"]',
    ARRAY['https://images.unsplash.com/photo-1519671482502-9759101d4561?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&w=800&q=80']
  ) ON CONFLICT DO NOTHING;

  -- Pricing for Venue 1 (Hourly model)
  INSERT INTO public.pricing_rules (venue_id, day_of_week, pricing_model, base_price, minimum_spend, min_hours)
  VALUES 
  ('11111111-1111-1111-1111-111111111111', 1, 'hourly', 500, 2000, 4), -- Mon
  ('11111111-1111-1111-1111-111111111111', 2, 'hourly', 500, 2000, 4), -- Tue
  ('11111111-1111-1111-1111-111111111111', 3, 'hourly', 500, 2000, 4), -- Wed
  ('11111111-1111-1111-1111-111111111111', 4, 'hourly', 600, 3000, 4), -- Thu
  ('11111111-1111-1111-1111-111111111111', 5, 'hourly', 800, 5000, 5), -- Fri
  ('11111111-1111-1111-1111-111111111111', 6, 'hourly', 1000, 6000, 5), -- Sat
  ('11111111-1111-1111-1111-111111111111', 0, 'hourly', 600, 3000, 4); -- Sun

  -- Venue 2: Loft Pinheiros
  INSERT INTO public.venues (id, host_id, title, description, slug, address_street, address_neighborhood, max_capacity_seated, max_capacity_standing, amenities, images)
  VALUES (
    '22222222-2222-2222-2222-222222222222',
    host_uid,
    'Loft Industrial Pinheiros',
    'Espaço versátil com pé direito alto, ideal para workshops e lançamentos de produtos.',
    'loft-pinheiros',
    'Rua dos Pinheiros, 500',
    'Pinheiros',
    80,
    120,
    '["wifi", "projetor", "cozinha", "acessibilidade"]',
    ARRAY['https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80']
  ) ON CONFLICT DO NOTHING;

  -- Pricing for Venue 2 (Daily model)
  INSERT INTO public.pricing_rules (venue_id, day_of_week, pricing_model, base_price, minimum_spend, min_hours)
  VALUES 
  ('22222222-2222-2222-2222-222222222222', 1, 'daily', 3000, 0, 1), -- Mon
  ('22222222-2222-2222-2222-222222222222', 2, 'daily', 3000, 0, 1), -- Tue
  ('22222222-2222-2222-2222-222222222222', 3, 'daily', 3000, 0, 1), -- Wed
  ('22222222-2222-2222-2222-222222222222', 4, 'daily', 3500, 0, 1), -- Thu
  ('22222222-2222-2222-2222-222222222222', 5, 'daily', 4500, 0, 1), -- Fri
  ('22222222-2222-2222-2222-222222222222', 6, 'daily', 5000, 0, 1), -- Sat
  ('22222222-2222-2222-2222-222222222222', 0, 'daily', 3500, 0, 1); -- Sun

  -- Venue 3: Espaço Paulista
  INSERT INTO public.venues (id, host_id, title, description, slug, address_street, address_neighborhood, max_capacity_seated, max_capacity_standing, amenities, images)
  VALUES (
    '33333333-3333-3333-3333-333333333333',
    host_uid,
    'Auditório Paulista',
    'Localização central, equipamentos de ponta e estrutura completa para conferências.',
    'auditorio-paulista',
    'Av. Paulista, 2000',
    'Bela Vista',
    200,
    200,
    '["wifi", "projetor", "som", "auditorio", "cafe"]',
    ARRAY['https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80']
  ) ON CONFLICT DO NOTHING;

  -- Pricing for Venue 3 (Per Person model)
  INSERT INTO public.pricing_rules (venue_id, day_of_week, pricing_model, base_price, minimum_spend, min_hours)
  VALUES 
  ('33333333-3333-3333-3333-333333333333', 1, 'per_person', 150, 5000, 4), -- Mon
  ('33333333-3333-3333-3333-333333333333', 2, 'per_person', 150, 5000, 4), -- Tue
  ('33333333-3333-3333-3333-333333333333', 3, 'per_person', 150, 5000, 4), -- Wed
  ('33333333-3333-3333-3333-333333333333', 4, 'per_person', 180, 6000, 4), -- Thu
  ('33333333-3333-3333-3333-333333333333', 5, 'per_person', 200, 8000, 5), -- Fri
  ('33333333-3333-3333-3333-333333333333', 6, 'per_person', 250, 10000, 5), -- Sat
  ('33333333-3333-3333-3333-333333333333', 0, 'per_person', 180, 6000, 4); -- Sun

  -- Global Packages
  INSERT INTO public.packages (venue_id, name, description, price, price_type, category)
  VALUES
  (NULL, 'Coffee Break Básico', 'Café, água, suco e petit fours', 35, 'per_person', 'food'),
  (NULL, 'Coffee Break Premium', 'Inclui sanduíches e frutas', 55, 'per_person', 'food'),
  (NULL, 'Fotografia (4h)', 'Fotógrafo profissional por 4 horas', 800, 'fixed', 'photography'),
  (NULL, 'Limpeza Extra', 'Taxa de limpeza pós-evento', 200, 'fixed', 'staff');

END $$;
