-- Salt Spring Island Community Ice Rink - Database Schema
-- Run this in Supabase SQL Editor to set up all tables

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  phone           TEXT,
  role            TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: session_types
-- ============================================
CREATE TABLE IF NOT EXISTS session_types (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                    TEXT NOT NULL,
  duration_min            INTEGER NOT NULL,
  default_capacity        INTEGER NOT NULL,
  default_price_adult     DECIMAL(10,2),
  default_price_child     DECIMAL(10,2),
  default_price_family    DECIMAL(10,2),
  color_hex               TEXT NOT NULL,
  description             TEXT,
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: sessions
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type_id         UUID REFERENCES session_types(id),
  date                    DATE NOT NULL,
  start_time              TIME NOT NULL,
  end_time                TIME NOT NULL,
  capacity                INTEGER NOT NULL,
  spots_remaining         INTEGER NOT NULL,
  price_override_adult    DECIMAL(10,2),
  price_override_child    DECIMAL(10,2),
  price_override_family   DECIMAL(10,2),
  status                  TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'full')),
  notes                   TEXT,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- Index for schedule queries
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_date_status ON sessions(date, status);

-- ============================================
-- Table: bookings
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID REFERENCES sessions(id),
  user_id             UUID REFERENCES users(id),
  guest_name          TEXT,
  guest_email         TEXT NOT NULL,
  guest_phone         TEXT,
  num_adults          INTEGER DEFAULT 0,
  num_children        INTEGER DEFAULT 0,
  is_family           BOOLEAN DEFAULT false,
  total_price         DECIMAL(10,2) NOT NULL,
  payment_status      TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  stripe_payment_id   TEXT,
  qr_code             TEXT,
  booked_at           TIMESTAMPTZ DEFAULT now(),
  cancelled_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bookings_session ON bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(guest_email);

-- ============================================
-- Table: season_passes
-- ============================================
CREATE TABLE IF NOT EXISTS season_passes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES users(id) NOT NULL,
  pass_type               TEXT NOT NULL CHECK (pass_type IN ('individual', 'family')),
  purchase_date           DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date             DATE NOT NULL,
  stripe_subscription_id  TEXT,
  is_active               BOOLEAN DEFAULT true,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Table: private_bookings
-- ============================================
CREATE TABLE IF NOT EXISTS private_bookings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id),
  contact_name        TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT,
  date                DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  package_type        TEXT NOT NULL CHECK (package_type IN ('1hr', '2hr', 'birthday')),
  guest_count         INTEGER,
  special_requests    TEXT,
  deposit_paid        DECIMAL(10,2),
  total_price         DECIMAL(10,2),
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  stripe_payment_id   TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Row-Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_bookings ENABLE ROW LEVEL SECURITY;

-- session_types: public read
CREATE POLICY "Anyone can view active session types"
  ON session_types FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage session types"
  ON session_types FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- sessions: public read
CREATE POLICY "Anyone can view sessions"
  ON sessions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage sessions"
  ON sessions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- bookings: guest insert allowed, authenticated read own, admin full
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (
    guest_email = (SELECT email FROM users WHERE id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Admins can manage bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- season_passes: authenticated insert, read own, admin full
CREATE POLICY "Authenticated users can create season passes"
  ON season_passes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own season passes"
  ON season_passes FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Admins can manage season passes"
  ON season_passes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- private_bookings: authenticated insert, read own, admin full
CREATE POLICY "Anyone can create private bookings"
  ON private_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own private bookings"
  ON private_bookings FOR SELECT
  USING (
    contact_email = (SELECT email FROM users WHERE id = auth.uid())
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Admins can manage private bookings"
  ON private_bookings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

-- users: read own, admin full
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Admins can manage users"
  ON users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );
