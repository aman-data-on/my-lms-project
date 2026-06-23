/*
# Create phase_progress table for phase-based learning journey

1. New Table: phase_progress
- Tracks which phases are unlocked/completed per user per course
- Links to assessments to track which phase assessments passed

2. Columns:
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- course_id (uuid, FK to courses)
- phase_number (int, 1-5)
- status (text: locked | in_progress | completed)
- assessment_passed (boolean)
- assessment_score (int, nullable)
- created_at / updated_at

3. RLS Policies
- Standard authenticated user policies
*/

CREATE TABLE IF NOT EXISTS phase_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  phase_number int NOT NULL CHECK (phase_number BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'completed')),
  assessment_passed boolean NOT NULL DEFAULT false,
  assessment_score int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id, phase_number)
);

ALTER TABLE phase_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_phase_progress" ON phase_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_phase_progress" ON phase_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_phase_progress" ON phase_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_phase_progress" ON phase_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Add task_submissions table for Phase 5 task submissions
CREATE TABLE IF NOT EXISTS task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('shadow_calls', 'mock_sales_flow', 'final_assessment')),
  content text NOT NULL,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'approved')),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_task_submissions" ON task_submissions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_task_submissions" ON task_submissions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_task_submissions" ON task_submissions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_task_submissions" ON task_submissions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
