-- ============================================================================
-- 1. ENUM TYPES
-- ============================================================================
CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE quiz_type AS ENUM ('multiple_choice', 'live_coding');

-- ============================================================================
-- 2. PENGGUNA & HAK AKSES (ROLE & MENTOR MAPPING)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. LEARNING PATH, MENTOR ASSIGNMENT, & KELAS
-- ============================================================================
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL, -- Contoh: "Dasar Pemrograman", "AI Engineer"
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel relasi untuk membagi mentor berdasarkan learning path yang diampu
CREATE TABLE mentor_learning_paths (
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (mentor_id, learning_path_id)
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    level course_level NOT NULL DEFAULT 'beginner',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pendaftaran pengguna ke kelas (Flow: user wajib enroll untuk akses kelas)
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ, -- Terisi otomatis saat progres mencapai 100%
    UNIQUE (user_id, course_id)
);

-- ============================================================================
-- 4. STRUKTUR KURIKULUM: BAB, MATERI (+ PLAYGROUND), & KUIZ (+ HINTS)
-- ============================================================================
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    order_index INT NOT NULL, -- Urutan bab di dalam kelas
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materi bacaan + dukungan Inline Code Playground ("Coba Sendiri")
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL, -- Format Markdown / HTML
    
    -- Konfigurasi Inline Code Playground
    has_playground BOOLEAN NOT NULL DEFAULT FALSE,
    playground_language VARCHAR(50), -- Contoh: 'python', 'javascript', 'cpp'
    playground_starter_code TEXT,    -- Kode awal yang muncul di editor materi
    
    order_index INT NOT NULL, -- Urutan item di dalam bab
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    quiz_type quiz_type NOT NULL,
    passing_score INT NOT NULL DEFAULT 70,
    order_index INT NOT NULL, -- Urutan item di dalam bab
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pertanyaan kuis (mendukung Pilihan Ganda & Live Coding + Progressive Hints)
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    points INT NOT NULL DEFAULT 10,
    order_index INT NOT NULL,

    -- Kolom khusus Pilihan Ganda (diisi jika quiz_type = 'multiple_choice')
    -- Format JSONB options: [{"id": "a", "text": "..."}, {"id": "b", "text": "..."}]
    options JSONB,
    correct_option_id VARCHAR(10),

    -- Kolom khusus Live Coding (diisi jika quiz_type = 'live_coding')
    programming_language VARCHAR(50),
    starter_code TEXT,
    solution_code TEXT,
    -- Format JSONB test_cases: [{"input": "2 3", "expected_output": "5", "is_hidden": false}]
    test_cases JSONB,
    -- FITUR 1: Progressive Hints (Array string petunjuk bertingkat)
    -- Format JSONB hints: ["Gunakan fungsi input()", "Pastikan tipe data diubah ke integer"]
    hints JSONB DEFAULT '[]'::jsonb
);

-- ============================================================================
-- 5. RIWAYAT PENGERJAAN KUIZ, PROGRES BELAJAR, & SERTIFIKAT
-- ============================================================================
CREATE TABLE quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL,
    is_passed BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_answers JSONB, -- Menyimpan jawaban pilihan ganda atau kode terakhir user
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FITUR 2: Progress Tracker & Tombol "Lanjutkan Belajar"
CREATE TABLE user_material_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Acuan tombol "Lanjutkan Belajar"
    completed_at TIMESTAMPTZ,
    UNIQUE (user_id, material_id)
);

-- FITUR 3: Generator Sertifikat Otomatis & Halaman Verifikasi Publik
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_code VARCHAR(50) UNIQUE NOT NULL, -- ID unik untuk URL /verify/[kode-unik]
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, course_id)
);

-- ============================================================================
-- 6. INDEXES UNTUK OPTIMASI QUERY
-- ============================================================================
CREATE INDEX idx_courses_learning_path ON courses(learning_path_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_chapters_course ON chapters(course_id, order_index);
CREATE INDEX idx_materials_chapter ON materials(chapter_id, order_index);
CREATE INDEX idx_quizzes_chapter ON quizzes(chapter_id, order_index);
CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id, order_index);
CREATE INDEX idx_quiz_submissions_user_quiz ON quiz_submissions(user_id, quiz_id);
CREATE INDEX idx_user_progress_last_accessed ON user_material_progress(user_id, last_accessed_at DESC);
CREATE INDEX idx_certificates_code ON certificates(certificate_code);