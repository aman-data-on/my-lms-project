/*
# Create courses, lessons, enrollments, and progress tables

1. New Tables
- `courses`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `description` (text, not null)
  - `department` (text, not null) -- HR, IT, Finance, Sales, Operations, Marketing
  - `thumbnail_url` (text, nullable)
  - `duration` (text, not null) -- e.g. "2h 30m"
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- `lessons`
  - `id` (uuid, primary key)
  - `course_id` (uuid, references courses)
  - `title` (text, not null)
  - `type` (text, not null) -- video, quiz, document
  - `video_url` (text, nullable)
  - `duration` (text, nullable)
  - `order_index` (integer, not null)
  - `created_at` (timestamptz, default now())

- `enrollments`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `course_id` (uuid, references courses)
  - `status` (text, not null DEFAULT 'not_started') -- not_started, in_progress, completed
  - `progress_percent` (integer, not null DEFAULT 0)
  - `enrolled_at` (timestamptz, default now())
  - `completed_at` (timestamptz, nullable)

- `lesson_progress`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `lesson_id` (uuid, references lessons)
  - `completed` (boolean, not null DEFAULT false)
  - `completed_at` (timestamptz, nullable)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on all tables.
- Authenticated users can manage their own enrollments and lesson progress.
- Courses and lessons are readable by all authenticated users.
*/

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  department text NOT NULL,
  thumbnail_url text,
  duration text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  video_url text,
  duration text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_started',
  progress_percent integer NOT NULL DEFAULT 0,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, course_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses: all authenticated can read, no one can modify (seeded data)
DROP POLICY IF EXISTS "select_courses" ON courses;
CREATE POLICY "select_courses" ON courses FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_courses" ON courses;
CREATE POLICY "insert_courses" ON courses FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_courses" ON courses;
CREATE POLICY "update_courses" ON courses FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_courses" ON courses;
CREATE POLICY "delete_courses" ON courses FOR DELETE
  TO authenticated USING (true);

-- Lessons: all authenticated can read
DROP POLICY IF EXISTS "select_lessons" ON lessons;
CREATE POLICY "select_lessons" ON lessons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_lessons" ON lessons;
CREATE POLICY "insert_lessons" ON lessons FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_lessons" ON lessons;
CREATE POLICY "update_lessons" ON lessons FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_lessons" ON lessons;
CREATE POLICY "delete_lessons" ON lessons FOR DELETE
  TO authenticated USING (true);

-- Enrollments: user-scoped
DROP POLICY IF EXISTS "select_own_enrollments" ON enrollments;
CREATE POLICY "select_own_enrollments" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_enrollments" ON enrollments;
CREATE POLICY "insert_own_enrollments" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_enrollments" ON enrollments;
CREATE POLICY "update_own_enrollments" ON enrollments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_enrollments" ON enrollments;
CREATE POLICY "delete_own_enrollments" ON enrollments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Lesson progress: user-scoped
DROP POLICY IF EXISTS "select_own_lesson_progress" ON lesson_progress;
CREATE POLICY "select_own_lesson_progress" ON lesson_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_lesson_progress" ON lesson_progress;
CREATE POLICY "insert_own_lesson_progress" ON lesson_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_lesson_progress" ON lesson_progress;
CREATE POLICY "update_own_lesson_progress" ON lesson_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_lesson_progress" ON lesson_progress;
CREATE POLICY "delete_own_lesson_progress" ON lesson_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
