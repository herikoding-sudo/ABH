-- Setup Schema SQL for Amanah Berkah Haromain CMS & Matrix Network System
-- Copy and paste this script into your Supabase SQL Editor to initialize all tables.

-- 1. SITE SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  phone TEXT DEFAULT '0895-1844-3354',
  deposit_amount NUMERIC DEFAULT 2500000,
  sponsor_reward NUMERIC DEFAULT 250000,
  fly1_reward NUMERIC DEFAULT 3500000,
  fly2_reward NUMERIC DEFAULT 30000000
);

-- Seed Settings
INSERT INTO site_settings (id, phone, deposit_amount, sponsor_reward, fly1_reward, fly2_reward)
VALUES ('global', '0895-1844-3354', 2500000, 250000, 3500000, 30000000)
ON CONFLICT (id) DO NOTHING;


-- 2. USER ACCOUNTS (Dynamic Authentication)
CREATE TABLE IF NOT EXISTS user_accounts (
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' -- 'pending', 'active'
);

-- Seed Mock Users
INSERT INTO user_accounts (email, password, role, name, status)
VALUES
('member@abh.com', 'member123', 'member', 'Ahmad (Member)', 'active'),
('admin@abh.com', 'admin123', 'admin', 'Budi (Admin)', 'active'),
('superadmin@abh.com', 'super123', 'superadmin', 'Siti (Superadmin)', 'active')
ON CONFLICT (email) DO NOTHING;


-- 3. PACKAGES
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  days TEXT NOT NULL,
  flight TEXT NOT NULL,
  madinah_hotel TEXT NOT NULL,
  makkah_hotel TEXT NOT NULL,
  bonus TEXT[] DEFAULT '{}',
  is_promo BOOLEAN DEFAULT false,
  is_vip BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0
);

-- Seed Packages
INSERT INTO packages (name, price, days, flight, madinah_hotel, makkah_hotel, bonus, is_promo, is_vip, order_index)
VALUES 
('Paket Hemat', '28.5 Juta', '9 Hari', 'Qatar / Oman / Emirates', 'Al Muhtara Golden / Jauharat Rosyid / Setaraf', 'Wahah Deafah / Mater Jewar / Setaraf', '{}', true, false, 0),
('Paket 12 D', '35 Juta', '12 Hari', 'Saudia / Garuda Direct (Tanpa Transit)', 'RuA International / ODST / Setaraf', 'Azka Assofa / Prestice / Rayyana / Anjum Hotel', '{}', false, false, 1),
('Paket VIP 9 D', '37.5 Juta', '9 Hari', 'Saudia / Garuda', 'Maden / Milenium Al Aqeq / Setaraf (Bintang 5)', 'Grand Zam Zam / Sofwah Orchid (Bintang 5)', '{"Free Kereta Cepat Madinah - Makkah"}', false, true, 2),
('Paket VIP 12 D', '40.5 Juta', '12 Hari', 'Saudia', 'Maden / Haritia / Setaraf (Bintang 5)', 'Grand Zam Zam / Sofwah Orchid / Fairmont Hotel (Bintang 5)', '{"Free Kereta Cepat", "Perlengkapan Eksklusif"}', false, true, 3);


-- 4. SCHEDULES
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  price TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'full'
  duration TEXT NOT NULL,
  flight TEXT NOT NULL,
  landing TEXT NOT NULL,
  image TEXT,
  all_in BOOLEAN DEFAULT false,
  order_index INT DEFAULT 0
);

-- Seed Schedules
INSERT INTO schedules (name, date, price, status, duration, flight, landing, image, all_in, order_index)
VALUES
('Amanah Promo 9D', '04 Sep 2026', 'Rp 28.5 Juta', 'open', '9 Hari', 'Qatar / Oman / Emir', 'Jeddah', '/images/umrah-1.jpg', true, 0),
('Berkah Hemat 9D', '11 Sep 2026', 'Rp 29.8 Juta', 'open', '9 Hari', 'Qatar / Oman / Emir', 'Madinah', '/images/umrah-2.jpg', true, 1),
('Haromain 12D Direct', '18 Sep 2026', 'Rp 35.0 Juta', 'open', '12 Hari', 'Saudia / Garuda', 'Jeddah', '/images/umrah-3.jpg', true, 2),
('VIP Bintang 5 9D', '25 Sep 2026', 'Rp 37.5 Juta', 'open', '9 Hari', 'Saudia / Garuda', 'Madinah', '/images/umrah-4.jpg', true, 3);


-- 5. SERVICES SLIDER
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  desc_text TEXT NOT NULL,
  image TEXT,
  order_index INT DEFAULT 0
);

-- Seed Services
INSERT INTO services (title, desc_text, image, order_index)
VALUES
('Haji Khusus', 'Layanan pendaftaran Haji Khusus resmi Kementerian Agama dengan masa tunggu lebih cepat dan fasilitas premium.', '/images/umrah-4.jpg', 0),
('Umroh Hemat & VIP', 'Pilihan paket perjalanan umroh reguler dengan fasilitas bintang 3 hingga VIP bintang 5 yang nyaman.', '/images/umrah-3.jpg', 1),
('Wisata Halal Internasional', 'Perjalanan wisata religi dan sejarah ke destinasi dunia dengan jaminan makanan halal serta waktu ibadah terjaga.', '/images/umrah-2.jpg', 2),
('Badal Haji & Umroh', 'Jasa pelaksanaan ibadah Haji atau Umroh untuk menggantikan anggota keluarga yang sakit keras atau telah wafat.', '/images/umrah-1.jpg', 3);


-- 6. MEMBER MATRIX STATES
CREATE TABLE IF NOT EXISTS member_matrix (
  email TEXT PRIMARY KEY,
  balance NUMERIC DEFAULT 0,
  downlines_count INT DEFAULT 0,
  has_completed_fly1 BOOLEAN DEFAULT false,
  has_completed_fly2 BOOLEAN DEFAULT false
);

-- Seed initial Member matrix state for demo user
INSERT INTO member_matrix (email, balance, downlines_count, has_completed_fly1, has_completed_fly2)
VALUES ('member@abh.com', 0, 0, false, false)
ON CONFLICT (email) DO NOTHING;


-- 7. MATRIX NODES
CREATE TABLE IF NOT EXISTS matrix_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_email TEXT NOT NULL,
  board_type TEXT NOT NULL, -- 'fly1' or 'fly2'
  node_index INT NOT NULL,
  name TEXT,
  email TEXT,
  is_user BOOLEAN DEFAULT false
);

-- Seed initial nodes for demo user
INSERT INTO matrix_nodes (member_email, board_type, node_index, name, email, is_user)
VALUES
('member@abh.com', 'fly1', 0, 'Ahmad (Member)', 'member@abh.com', true),
('member@abh.com', 'fly1', 1, 'Farhan', 'farhan@email.com', false),
('member@abh.com', 'fly1', 2, 'Diana', 'diana@email.com', false),
('member@abh.com', 'fly1', 3, 'Eko', 'eko@email.com', false),
('member@abh.com', 'fly1', 4, 'Fitri', 'fitri@email.com', false),
('member@abh.com', 'fly2', 0, 'Ahmad (Member)', 'member@abh.com', true),
('member@abh.com', 'fly2', 1, 'Sponsor A', 'sp_a@email.com', false),
('member@abh.com', 'fly2', 2, 'Sponsor B', 'sp_b@email.com', false),
('member@abh.com', 'fly2', 3, 'Mitra C', 'm_c@email.com', false),
('member@abh.com', 'fly2', 4, 'Mitra D', 'm_d@email.com', false),
('member@abh.com', 'fly2', 5, 'Mitra E', 'm_e@email.com', false),
('member@abh.com', 'fly2', 6, 'Mitra F', 'm_f@email.com', false),
('member@abh.com', 'fly2', 7, 'Mitra G', 'm_g@email.com', false),
('member@abh.com', 'fly2', 8, 'Mitra H', 'm_h@email.com', false),
('member@abh.com', 'fly2', 9, 'Mitra I', 'm_i@email.com', false),
('member@abh.com', 'fly2', 10, 'Mitra J', 'm_j@email.com', false),
('member@abh.com', 'fly2', 11, 'Mitra K', 'm_k@email.com', false),
('member@abh.com', 'fly2', 12, 'Mitra L', 'm_l@email.com', false);


-- 8. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_email TEXT NOT NULL,
  date_text TEXT NOT NULL,
  tx_type TEXT NOT NULL, -- 'sponsor', 'fly1', 'fly2', 'deposit'
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed initial transactions
INSERT INTO transactions (member_email, date_text, tx_type, amount, description)
VALUES ('member@abh.com', '19/07/2026', 'deposit', -2500000, 'Setoran Awal Registrasi Member Umroh');


-- 9. DEPOSIT REQUESTS
CREATE TABLE IF NOT EXISTS deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_email TEXT NOT NULL,
  recruit_name TEXT NOT NULL,
  recruit_email TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  proof_image TEXT,
  date_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed demo deposit request
INSERT INTO deposit_requests (sponsor_email, recruit_name, recruit_email, amount, status, proof_image, date_text)
VALUES ('member@abh.com', 'Gita Hermawan', 'gita@email.com', 2500000, 'pending', '/images/proof-mock.png', '19/07/2026');
