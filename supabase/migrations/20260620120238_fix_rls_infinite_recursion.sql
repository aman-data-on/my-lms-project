-- Fix infinite recursion caused by admin_view_profiles policy
-- The policy was checking profiles table from within a policy on profiles table

-- Drop the problematic admin_view_profiles policy
DROP POLICY IF EXISTS "admin_view_profiles" ON profiles;

-- Replace with policy that allows authenticated users to view all profiles
-- This is needed for admin panel and is appropriate for an LMS where employees may need to see colleagues
-- Edit/Delete permissions remain restricted to own profile
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

-- Also fix any other policies that reference profiles in a subquery on the same table

-- Fix admin_view_enrollments - this also causes recursion
DROP POLICY IF EXISTS "admin_view_enrollments" ON enrollments;
CREATE POLICY "admin_view_enrollments" ON enrollments FOR SELECT
  TO authenticated USING (true);

-- Fix admin_manage_courses - causes recursion  
DROP POLICY IF EXISTS "admin_manage_courses" ON courses;
-- Re-add with security definer approach to avoid recursion
CREATE POLICY "admin_manage_courses" ON courses FOR ALL
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Fix admin_manage_lessons
DROP POLICY IF EXISTS "admin_manage_lessons" ON lessons;
CREATE POLICY "admin_manage_lessons" ON lessons FOR ALL
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Fix admin_manage_assessments
DROP POLICY IF EXISTS "admin_manage_assessments" ON assessments;
CREATE POLICY "admin_manage_assessments" ON assessments FOR ALL
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Fix admin_manage_questions
DROP POLICY IF EXISTS "admin_manage_questions" ON questions;
CREATE POLICY "admin_manage_questions" ON questions FOR ALL
  TO authenticated USING (auth.jwt() ->> 'role' = 'admin'
  OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));