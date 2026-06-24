# API Documentation

> All server interactions go through `src/lib/api.ts`.
> No page component imports `supabase` directly for data access.
> Last updated: 2026-06-24 (post-P2)

## Overview

`src/lib/api.ts` is the single data-access layer between the React application and Supabase. It exports:
- Pure async functions for all reads and writes
- Shared constants used by both the API layer and components
- No React hooks — these are plain functions compatible with react-query's `queryFn` and `mutationFn`

---

## Constants

### `SALES_COURSE_ID`
```typescript
export const SALES_COURSE_ID = 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4'
```
The UUID of the Sales Onboarding course. Used to apply phase-gating logic in Assessments.

### `SALES_ASSESSMENT_ORDER`
```typescript
export const SALES_ASSESSMENT_ORDER: string[]
```
Ordered list of the 5 Sales Onboarding assessment titles. Used to sort assessments and compute phase numbers on submission.

---

## Course Functions

### `fetchCourse(courseId)`
```typescript
async function fetchCourse(courseId: string): Promise<Course>
```
Fetches a single course by ID. Throws on not-found.
- **Query:** `courses` by `id`

### `fetchLessons(courseId)`
```typescript
async function fetchLessons(courseId: string): Promise<Lesson[]>
```
Fetches all lessons for a course, ordered by `order_index`.
- **Query:** `lessons` filtered by `course_id`, ordered by `order_index`

### `fetchCourseLibrary(userId)`
```typescript
async function fetchCourseLibrary(userId: string): Promise<{
  courses: Course[];
  enrollments: Enrollment[];
}>
```
Parallel fetch of all published courses and the user's enrollments. Returns both in one object for the CourseLibrary page.
- **Queries (parallel):** `courses` where `status = 'published'` + `enrollments` where `user_id = userId`

### `fetchMyCourses(userId)`
```typescript
async function fetchMyCourses(userId: string): Promise<CourseWithProgress[]>
```
Fetches the user's enrolled courses with progress data, joined to course details.
- **Query:** `enrollments` joined to `courses`, filtered by `user_id`, ordered by `enrolled_at` DESC

---

## Progress Functions

### `fetchLessonProgress(userId)`
```typescript
async function fetchLessonProgress(userId: string): Promise<LessonProgress[]>
```
Returns all completed lesson progress entries for the user.
- **Query:** `lesson_progress` where `user_id = userId AND completed = true`

### `upsertLessonProgress(payload)`
```typescript
async function upsertLessonProgress(payload: LessonProgressPayload): Promise<void>
```
Inserts or updates a lesson progress record.
- **Mutation:** `lesson_progress` UPSERT

### `upsertEnrollment(payload)`
```typescript
async function upsertEnrollment(payload: EnrollmentPayload): Promise<void>
```
Inserts or updates an enrollment record (used to update progress_percent and status).
- **Mutation:** `enrollments` UPSERT

### `insertActivity(payload)`
```typescript
async function insertActivity(payload: ActivityPayload): Promise<void>
```
Records a user activity event.
- **Mutation:** `activities` INSERT

---

## Enrollment Functions

### `enrollInCourse(userId, courseId, courseTitle)`
```typescript
async function enrollInCourse(userId: string, courseId: string, courseTitle: string): Promise<void>
```
Creates an enrollment record (`in_progress`, 0%) and logs an activity.
- **Mutation:** `enrollments` INSERT + `activities` INSERT

---

## Certificate Functions

### `fetchCertificates(userId)`
```typescript
async function fetchCertificates(userId: string): Promise<Certificate[]>
```
Returns all certificates for the user, ordered by `issued_at` DESC.
- **Query:** `certificates` where `user_id = userId`

---

## Profile Functions

### `updateProfile(userId, data)`
```typescript
async function updateProfile(
  userId: string,
  data: { full_name: string; employee_id: string; department: string; job_title: string }
): Promise<void>
```
Updates the user's profile. Does not allow `role` changes (enforced by database RLS).
- **Mutation:** `profiles` UPDATE where `id = userId`

---

## Assessment Functions

### `fetchAssessmentsData(userId)`
```typescript
async function fetchAssessmentsData(userId: string): Promise<{
  courseGroups: CourseGroup[];
  allCourses: { id: string; title: string }[];
  attempts: Attempt[];
  questionCounts: Record<string, number>;
}>
```
Main data loader for the Assessments page. Performs 3 parallel queries + 1 batched question-count query:
1. All assessments with course join
2. All courses (for admin builder dropdown)
3. User's assessment attempts
4. Question counts per assessment (single IN query, not N serial queries)

Returns assessments pre-grouped and pre-sorted into `courseGroups` (Sales first, then alphabetical).

### `fetchAssessmentQuestions(assessmentId)`
```typescript
async function fetchAssessmentQuestions(assessmentId: string): Promise<Question[]>
```
Fetches all questions for an assessment, ordered by `order_index`.
- **Query:** `questions` where `assessment_id = assessmentId`

### `startAssessmentAttempt(userId, assessmentId, assessmentTitle)`
```typescript
async function startAssessmentAttempt(
  userId: string,
  assessmentId: string,
  assessmentTitle: string
): Promise<void>
```
Creates an `in_progress` attempt record and logs an `assessment_started` activity.

### `submitAssessment(params)`
```typescript
async function submitAssessment(params: {
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  courseId: string | null;
  courseName: string;
  score: number;
  passed: boolean;
  answers: Record<string, any>;
  salesPhaseIndex?: number;
}): Promise<void>
```
Handles the full assessment submission flow:
1. Updates attempt record with score and status (`passed` | `failed`)
2. Inserts activity record
3. If passed: inserts a certificate record
4. If passed and Sales Onboarding course: updates `phase_progress` for the current phase and unlocks the next

### `createAssessment(data, questions)`
```typescript
async function createAssessment(
  data: { title: string; course_id: string | null; time_limit: number; passing_score: number },
  questions: Question[]
): Promise<void>
```
Admin builder: creates an assessment record, then serially inserts each question.

---

## Dashboard Functions

### `fetchDashboardData(userId)`
```typescript
async function fetchDashboardData(userId: string): Promise<DashboardData>
```
Aggregates all data needed for the Dashboard in sequential queries:
1. Enrollments with course join → stats (enrolled, completed counts) + continue-learning card
2. Certificates count → `certificatesEarned` stat
3. Assessment attempts in `in_progress`/`started` state → `pendingAssessments` stat
4. Recent activities (last 6)
5. Upcoming assessments (if enrolled)

Returns: `{ stats, continueCourse, activities, upcoming }`

---

## Error Handling

All functions throw on error (Supabase error objects). Callers (react-query `useQuery`/`useMutation`) handle errors via the `isError`/`error` state or `onError` callbacks. No silent error swallowing inside `api.ts`.

---

## Supabase Edge Functions

### `seed-users` (deployed to Supabase)
- **Location:** `supabase/functions/seed-users/index.ts`
- **Purpose:** Creates test users in `auth.users` and inserts corresponding `profiles` rows
- **Invocation:** `curl -X POST https://cthnljvcfnzxluedquxf.supabase.co/functions/v1/seed-users -H "Authorization: Bearer <anon-key>"`
- **Auth:** Anon key is sufficient (function is permissive for seeding only)
