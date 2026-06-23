/*
# Add role column to profiles and status column to courses

1. Changes
- Add `role` column to `profiles` table (text, default 'employee')
- Add `status` column to `courses` table (text, default 'published') — values: 'draft', 'published'
- Add `section` column to `lessons` table (text, nullable) for curriculum sections
- Update RLS policies to allow admins to manage all data

2. Security
- Existing policies remain for user-scoped access
- Add admin-specific policies for full CRUD access
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'employee';

ALTER TABLE courses ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS section text;

-- Update existing courses to published
UPDATE courses SET status = 'published' WHERE status IS NULL;

-- Admin can manage all courses
DROP POLICY IF EXISTS "admin_manage_courses" ON courses;
CREATE POLICY "admin_manage_courses" ON courses FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can manage all lessons
DROP POLICY IF EXISTS "admin_manage_lessons" ON lessons;
CREATE POLICY "admin_manage_lessons" ON lessons FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can manage all assessments
DROP POLICY IF EXISTS "admin_manage_assessments" ON assessments;
CREATE POLICY "admin_manage_assessments" ON assessments FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can manage all questions
DROP POLICY IF EXISTS "admin_manage_questions" ON questions;
CREATE POLICY "admin_manage_questions" ON questions FOR ALL
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can view all profiles
DROP POLICY IF EXISTS "admin_view_profiles" ON profiles;
CREATE POLICY "admin_view_profiles" ON profiles FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Admin can view all enrollments
DROP POLICY IF EXISTS "admin_view_enrollments" ON enrollments;
CREATE POLICY "admin_view_enrollments" ON enrollments FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
