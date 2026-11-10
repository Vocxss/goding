BEGIN;

-- Pastikan ekstensi gen_random_uuid tersedia untuk versi PG lama (bawaan sejak PG 13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. CUSTOM ENUM TYPES
-- ==========================================
CREATE TYPE user_role AS ENUM ('STUDENT', 'MENTOR', 'ADMIN');
CREATE TYPE access_tier AS ENUM ('FREE', 'PRO');
CREATE TYPE lesson_type AS ENUM ('QUIZ', 'GUIDED', 'DEBUGGING', 'BLANK_CANVAS');
CREATE TYPE progress_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE brief_category AS ENUM ('BUSINESS_TYPE', 'BUSINESS_RULE', 'COLOR_THEME', 'FEATURE_TWIST');
CREATE TYPE project_status AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_NEEDED', 'APPROVED');
CREATE TYPE review_decision AS ENUM ('REVISION_NEEDED', 'APPROVED');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED');

-- ==========================================
-- 2. TRIGGER FUNCTION UNTUK UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 3. PENGGUNA, STREAK & AKSES
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT, -- Nullable jika login memakai OAuth (Google/GitHub)
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'STUDENT',
  headline VARCHAR(160), -- Ditampilkan di Public Portfolio Card atau profil Mentor
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INT NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  streak_freeze_count INT NOT NULL DEFAULT 1 CHECK (streak_freeze_count >= 0),
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_percent INT NOT NULL DEFAULT 100 CHECK (discount_percent BETWEEN 1 AND 100),
  max_uses INT CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_voucher_usage CHECK (max_uses IS NULL OR used_count <= max_uses)
);

CREATE TABLE user_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  tier access_tier NOT NULL DEFAULT 'FREE',
  voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  payment_reference VARCHAR(120), -- ID transaksi dari payment gateway lokal
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL berarti akses selamanya untuk jalur tersebut
  UNIQUE (user_id, learning_path_id)
);

-- ==========================================
-- 4. KURIKULUM, SANDBOX & PROGRES BELAJAR
-- ==========================================
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  slug VARCHAR(120) NOT NULL,
  title VARCHAR(180) NOT NULL,
  lesson_type lesson_type NOT NULL,
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  content_md TEXT NOT NULL, -- Materi instruksi dalam format Markdown
  starter_code JSONB NOT NULL DEFAULT '{"html": "", "css": "", "js": ""}'::jsonb, -- Diisi kode rusak jika DEBUGGING, kosong jika BLANK_CANVAS
  solution_code JSONB, -- Referensi solusi untuk Admin/Mentor
  test_script TEXT, -- Skrip assertion JS yang dieksekusi di sandboxed iframe
  quiz_payload JSONB, -- Diisi soal & opsi jika lesson_type = 'QUIZ'
  hints JSONB NOT NULL DEFAULT '[]'::jsonb, -- Petunjuk bertahap
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, slug)
);

CREATE TABLE lesson_mentor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL, -- Catatan soal ambigu atau bug test case untuk Admin
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status progress_status NOT NULL DEFAULT 'NOT_STARTED',
  saved_code JSONB NOT NULL DEFAULT '{"html": "", "css": "", "js": ""}'::jsonb, -- Auto-save kode terakhir siswa
  attempts_count INT NOT NULL DEFAULT 0 CHECK (attempts_count >= 0),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, lesson_id)
);

-- ==========================================
-- 6. DYNAMIC PROJECT BRIEF & PORTOFOLIO
-- ==========================================
CREATE TABLE student_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  generated_brief JSONB NOT NULL, -- Kombinasi unik variabel UMKM yang terkunci per siswa
  submitted_code JSONB NOT NULL DEFAULT '{"html": "", "css": "", "js": ""}'::jsonb,
  demo_url TEXT,
  auto_test_passed BOOLEAN NOT NULL DEFAULT FALSE,
  status project_status NOT NULL DEFAULT 'ASSIGNED',
  portfolio_slug VARCHAR(140) UNIQUE, -- URL unik Public Portfolio Card
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, template_id)
);

CREATE TABLE project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES student_projects(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rubric_scores JSONB NOT NULL, -- Misal: {"struktur": 90, "logika": 85, "tata_letak": 88}
  inline_comments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Komentar per file/baris kode
  general_feedback TEXT NOT NULL,
  decision review_decision NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 7. TRIGGERS OTOMATIS UPDATED_AT
-- ==========================================
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_student_stats_updated_at BEFORE UPDATE ON student_stats FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lesson_progress_updated_at BEFORE UPDATE ON lesson_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_error_translations_updated_at BEFORE UPDATE ON error_translations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_project_templates_updated_at BEFORE UPDATE ON project_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_student_projects_updated_at BEFORE UPDATE ON student_projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_unstuck_tickets_updated_at BEFORE UPDATE ON unstuck_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ==========================================
-- 8. INDEXING UNTUK PERFORMA QUERIES
-- ==========================================
-- Urutan kurikulum
CREATE INDEX idx_modules_path_order ON modules(learning_path_id, sort_order);
CREATE INDEX idx_lessons_module_order ON lessons(module_id, sort_order);

-- Dasbor progres siswa & laporan drop-off Admin
CREATE INDEX idx_lesson_progress_student ON lesson_progress(student_id, status);
CREATE INDEX idx_lesson_progress_lesson_status ON lesson_progress(lesson_id, status);
CREATE INDEX idx_error_logs_lesson ON error_logs(lesson_id, created_at DESC);

COMMIT;