-- ─────────────────────────────────────────────────────────────────────────────
-- Topic-level progression
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds a granular, per-topic progress layer WITHOUT touching the existing
-- module-level `lesson_progress` table. `lesson_progress` remains the single
-- authority for module completion / unlock / phase progression; this table
-- ROLLS UP into it (see src/lib/completion.ts + CourseDetail). Purely additive:
--   * existing unlock, dashboards, reports, certificates keep reading
--     `lesson_progress` unchanged;
--   * historical completions are preserved (no backfill, no destructive change).
--
-- Topic identity
--   A topic is identified by (lesson_id, topic_key) where `topic_key` is the
--   STABLE content block id from the lesson JSON (deriveTopics) — never a array
--   position, never regenerated on rename/reorder. So progress survives content
--   edits as long as block ids are treated as permanent identifiers.
--
-- Completion model
--   `status` stays a simple binary the rollup can ask "is this complete?".
--   HOW completion is reached per learning-activity type (reading reaches end,
--   quiz passing score, video watch %, assignment submitted/approved, lab/…)
--   lives in the code-side completion engine, which reads `topic_type` +
--   `metadata` + `progress_ratio`. New activity types plug in there with NO
--   schema change. Weighting (reading=1, quiz=2, lab=5, …) is likewise a
--   calculation concern owned by the engine, so weights can be re-tuned without
--   a data migration.
--
-- Analytics readiness
--   `topic_type`, `first_visited_at`, `visited_at`, `completed_at`,
--   `time_spent_seconds`, `progress_ratio` and `metadata` are captured so future
--   analytics (time-per-topic, drop-off, skipped topics, quiz pass rates,
--   hardest modules) are answerable without another redesign. Not built now.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS topic_progress (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id          uuid NOT NULL REFERENCES lessons(id)    ON DELETE CASCADE,
  -- Denormalized for fast per-course rollups + analytics. Nullable so a row can
  -- still be written if the course link is momentarily unknown.
  course_id          uuid REFERENCES courses(id) ON DELETE CASCADE,

  -- Stable content identifier for the topic (block id from deriveTopics).
  topic_key          text NOT NULL,

  -- Learning-activity type. Snapshot for analytics + lets the engine pick the
  -- right completion rule. Extensible — values validated in code, not by a
  -- narrow DB enum, so new types never require a schema change.
  topic_type         text NOT NULL DEFAULT 'reading',

  -- Binary state the rollup queries. 'in_progress' = visited but rule not yet
  -- satisfied; 'completed' = activity's completion rule satisfied.
  status             text NOT NULL DEFAULT 'in_progress'
                       CHECK (status IN ('in_progress', 'completed')),

  -- Fractional progress 0..1 (scroll depth, video watch %, quiz best score).
  -- Drives partial-progress UI + analytics; the binary `status` is authoritative
  -- for completion.
  progress_ratio     numeric(5,4) NOT NULL DEFAULT 0
                       CHECK (progress_ratio >= 0 AND progress_ratio <= 1),

  -- Activity-specific result: { score, attempts, passed, watch_percent,
  -- last_position, submission_id, state, ... }. Engine reads this per type.
  metadata           jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Analytics: cumulative dwell time on the topic.
  time_spent_seconds integer NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),

  first_visited_at   timestamptz NOT NULL DEFAULT now(),
  visited_at         timestamptz NOT NULL DEFAULT now(),  -- resume = MAX(visited_at)
  completed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),

  -- One row per learner per topic → clean idempotent upsert target.
  UNIQUE (user_id, lesson_id, topic_key)
);

-- Resume + per-module rollup: all of a learner's topics in a lesson.
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_lesson
  ON topic_progress (user_id, lesson_id);

-- Dashboard / course-wide rollups for a learner.
CREATE INDEX IF NOT EXISTS idx_topic_progress_user_course
  ON topic_progress (user_id, course_id);

-- Cross-learner analytics (drop-off, skipped topics, pass rates) per topic.
CREATE INDEX IF NOT EXISTS idx_topic_progress_lesson_topic
  ON topic_progress (lesson_id, topic_key);

-- Keep updated_at honest regardless of how a row is written.
CREATE OR REPLACE FUNCTION set_topic_progress_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_topic_progress_updated_at ON topic_progress;
CREATE TRIGGER trg_topic_progress_updated_at
  BEFORE UPDATE ON topic_progress
  FOR EACH ROW EXECUTE FUNCTION set_topic_progress_updated_at();

-- ── RLS: a learner can only see and write their own rows (mirrors lesson_progress)
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_topic_progress" ON topic_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_topic_progress" ON topic_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_topic_progress" ON topic_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_topic_progress" ON topic_progress
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
