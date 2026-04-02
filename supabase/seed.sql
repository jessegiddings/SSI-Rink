-- Seed data for SSI Ice Rink
-- Run this after migrations to populate sample data

-- ============================================
-- Session Types
-- ============================================
INSERT INTO session_types (name, duration_min, default_capacity, default_price_adult, default_price_child, default_price_family, color_hex, description) VALUES
  ('Open Skate — General', 90, 20, 7.00, 5.00, 20.00, '#00A3E0', 'General open skating for all ages. Price includes skate rental and helmet.'),
  ('After-School Skate', 90, 15, 5.00, 5.00, NULL, '#10B981', 'Discounted after-school skating program for students.'),
  ('Family Skate', 90, 20, NULL, NULL, 20.00, '#0D9488', 'Dedicated family skating time. $20 per family regardless of size.'),
  ('KidSport Free Skate', 90, 20, 0.00, 0.00, 0.00, '#F59E0B', 'Free skating for kids, subsidized by KidSport. Equipment provided.'),
  ('Senior Skate', 60, 15, 5.00, NULL, NULL, '#7C3AED', 'Relaxed skating session for seniors. Gentle pace, great company.'),
  ('Private Rental', 120, 1, 150.00, NULL, NULL, '#D4A843', 'Exclusive rink rental. 1-2 hours available. Contact us for details.'),
  ('Birthday Party', 120, 1, 250.00, NULL, NULL, '#EC4899', 'Birthday party package includes exclusive rink time, setup, and clean-up.'),
  ('Stick & Puck', 60, 10, 10.00, 10.00, NULL, '#E84855', 'Bring your stick and puck! Helmets required. No body checking.');

-- ============================================
-- Sample Sessions (one week starting from next Monday)
-- Uses dynamic dates relative to current date
-- ============================================

-- Helper: get the next Monday
DO $$
DECLARE
  next_mon DATE := CURRENT_DATE + ((8 - EXTRACT(DOW FROM CURRENT_DATE)::int) % 7);
  open_skate_id UUID;
  after_school_id UUID;
  family_skate_id UUID;
  kidsport_id UUID;
  senior_id UUID;
  stick_puck_id UUID;
BEGIN
  -- If today is Monday, use today
  IF EXTRACT(DOW FROM CURRENT_DATE) = 1 THEN
    next_mon := CURRENT_DATE;
  END IF;

  SELECT id INTO open_skate_id FROM session_types WHERE name = 'Open Skate — General';
  SELECT id INTO after_school_id FROM session_types WHERE name = 'After-School Skate';
  SELECT id INTO family_skate_id FROM session_types WHERE name = 'Family Skate';
  SELECT id INTO kidsport_id FROM session_types WHERE name = 'KidSport Free Skate';
  SELECT id INTO senior_id FROM session_types WHERE name = 'Senior Skate';
  SELECT id INTO stick_puck_id FROM session_types WHERE name = 'Stick & Puck';

  -- Monday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (open_skate_id, next_mon, '10:00', '11:30', 20, 20),
    (after_school_id, next_mon, '15:30', '17:00', 15, 15),
    (stick_puck_id, next_mon, '18:00', '19:00', 10, 10);

  -- Tuesday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (senior_id, next_mon + 1, '10:00', '11:00', 15, 15),
    (open_skate_id, next_mon + 1, '13:00', '14:30', 20, 20),
    (after_school_id, next_mon + 1, '15:30', '17:00', 15, 15);

  -- Wednesday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (kidsport_id, next_mon + 2, '10:00', '11:30', 20, 20),
    (open_skate_id, next_mon + 2, '13:00', '14:30', 20, 14),
    (stick_puck_id, next_mon + 2, '18:00', '19:00', 10, 10);

  -- Thursday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (senior_id, next_mon + 3, '10:00', '11:00', 15, 15),
    (family_skate_id, next_mon + 3, '13:00', '14:30', 20, 20),
    (after_school_id, next_mon + 3, '15:30', '17:00', 15, 15);

  -- Friday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (open_skate_id, next_mon + 4, '10:00', '11:30', 20, 20),
    (open_skate_id, next_mon + 4, '13:00', '14:30', 20, 20),
    (stick_puck_id, next_mon + 4, '18:00', '19:00', 10, 3);

  -- Saturday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (open_skate_id, next_mon + 5, '10:00', '11:30', 20, 20),
    (family_skate_id, next_mon + 5, '13:00', '14:30', 20, 20),
    (open_skate_id, next_mon + 5, '15:00', '16:30', 20, 0),
    (stick_puck_id, next_mon + 5, '18:00', '19:00', 10, 10);

  -- Sunday
  INSERT INTO sessions (session_type_id, date, start_time, end_time, capacity, spots_remaining) VALUES
    (family_skate_id, next_mon + 6, '10:00', '11:30', 20, 20),
    (open_skate_id, next_mon + 6, '13:00', '14:30', 20, 20),
    (kidsport_id, next_mon + 6, '15:00', '16:30', 20, 20);

  -- Mark the full session
  UPDATE sessions SET status = 'full' WHERE spots_remaining = 0;
END $$;
