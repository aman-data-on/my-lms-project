/*
# Create assessments, questions, attempts, and certificates tables

1. New Tables
- `assessments`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `course_id` (uuid, references courses, nullable)
  - `time_limit` (integer, not null) -- minutes
  - `passing_score` (integer, not null) -- percentage
  - `created_at` (timestamptz, default now())

- `questions`
  - `id` (uuid, primary key)
  - `assessment_id` (uuid, references assessments)
  - `type` (text, not null) -- multiple_choice, true_false, fill_blank, matching, short_answer, long_answer
  - `question_text` (text, not null)
  - `options` (jsonb, nullable) -- for multiple_choice
  - `correct_answer` (text, nullable)
  - `matching_pairs` (jsonb, nullable) -- for matching
  - `manual_grading` (boolean, DEFAULT false)
  - `order_index` (integer, not null)
  - `created_at` (timestamptz, default now())

- `assessment_attempts`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `assessment_id` (uuid, references assessments)
  - `score` (integer, nullable)
  - `status` (text, not null DEFAULT 'in_progress') -- in_progress, completed, passed, failed
  - `answers` (jsonb, nullable)
  - `started_at` (timestamptz, default now())
  - `submitted_at` (timestamptz, nullable)

- `certificates`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `course_id` (uuid, references courses, nullable)
  - `course_name` (text, not null)
  - `score` (integer, nullable)
  - `certificate_id` (text, not null)
  - `issued_at` (timestamptz, default now())

- `activities`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `type` (text, not null) -- course_enrolled, lesson_completed, assessment_started, assessment_completed, certificate_earned
  - `title` (text, not null)
  - `description` (text, nullable)
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on all tables.
- Assessments and questions readable by all authenticated users.
- Attempts and certificates user-scoped.
- Activities user-scoped.
*/

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  time_limit integer NOT NULL,
  passing_score integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  type text NOT NULL,
  question_text text NOT NULL,
  options jsonb,
  correct_answer text,
  matching_pairs jsonb,
  manual_grading boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score integer,
  status text NOT NULL DEFAULT 'in_progress',
  answers jsonb,
  started_at timestamptz DEFAULT now(),
  submitted_at timestamptz
);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  course_name text NOT NULL,
  score integer,
  certificate_id text NOT NULL,
  issued_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Assessments: all authenticated can CRUD
DROP POLICY IF EXISTS "select_assessments" ON assessments;
CREATE POLICY "select_assessments" ON assessments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_assessments" ON assessments;
CREATE POLICY "insert_assessments" ON assessments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_assessments" ON assessments;
CREATE POLICY "update_assessments" ON assessments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_assessments" ON assessments;
CREATE POLICY "delete_assessments" ON assessments FOR DELETE
  TO authenticated USING (true);

-- Questions: all authenticated can CRUD
DROP POLICY IF EXISTS "select_questions" ON questions;
CREATE POLICY "select_questions" ON questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_questions" ON questions;
CREATE POLICY "insert_questions" ON questions FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_questions" ON questions;
CREATE POLICY "update_questions" ON questions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_questions" ON questions;
CREATE POLICY "delete_questions" ON questions FOR DELETE
  TO authenticated USING (true);

-- Assessment attempts: user-scoped
DROP POLICY IF EXISTS "select_own_attempts" ON assessment_attempts;
CREATE POLICY "select_own_attempts" ON assessment_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_attempts" ON assessment_attempts;
CREATE POLICY "insert_own_attempts" ON assessment_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_attempts" ON assessment_attempts;
CREATE POLICY "update_own_attempts" ON assessment_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_attempts" ON assessment_attempts;
CREATE POLICY "delete_own_attempts" ON assessment_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Certificates: user-scoped
DROP POLICY IF EXISTS "select_own_certificates" ON certificates;
CREATE POLICY "select_own_certificates" ON certificates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_certificates" ON certificates;
CREATE POLICY "insert_own_certificates" ON certificates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_certificates" ON certificates;
CREATE POLICY "update_own_certificates" ON certificates FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_certificates" ON certificates;
CREATE POLICY "delete_own_certificates" ON certificates FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Activities: user-scoped
DROP POLICY IF EXISTS "select_own_activities" ON activities;
CREATE POLICY "select_own_activities" ON activities FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_activities" ON activities;
CREATE POLICY "insert_own_activities" ON activities FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_activities" ON activities;
CREATE POLICY "update_own_activities" ON activities FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_activities" ON activities;
CREATE POLICY "delete_own_activities" ON activities FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
