# UX Audit

> Audit date: 2026-06-24 (post-P2 baseline)
> Method: Heuristic evaluation against Nielsen's 10 usability heuristics

## Heuristic Scores

| Heuristic | Score | Notes |
|-----------|-------|-------|
| 1. Visibility of system status | 3/5 | Loading spinners present; no toast for mutations |
| 2. Match between system and real world | 4/5 | Clear language; course/assessment terminology matches user expectations |
| 3. User control and freedom | 2/5 | No undo; no cancel on assessment submission |
| 4. Consistency and standards | 3/5 | Button styles mostly consistent; card patterns vary between pages |
| 5. Error prevention | 2/5 | No confirmation dialogs on destructive/final actions |
| 6. Recognition rather than recall | 4/5 | Icons paired with labels in sidebar; status badges clear |
| 7. Flexibility and efficiency | 2/5 | No keyboard shortcuts; no quick actions; no search |
| 8. Aesthetic and minimalist design | 4/5 | Clean, low-noise UI; no visual clutter |
| 9. Help users recognize/recover from errors | 2/5 | Error messages are raw Supabase strings in some places |
| 10. Help and documentation | 1/5 | No in-app help, tooltips, or onboarding guidance |

---

## Detailed Findings by Page

### Dashboard

**Strengths:**
- Stats row gives clear overview ✅
- Continue learning card is prominent ✅
- Activity feed shows recent actions ✅

**Issues:**
- New users with no enrollments see empty stats with no guidance
- "Upcoming" section shows all assessments, not just user's enrolled ones
- No welcome message for first-time users

**P3 fix:** Add empty-state onboarding card for users with 0 enrollments → CTA to CourseLibrary

---

### MyCourses

**Strengths:**
- Progress bar clearly shows completion ✅
- Department badge and duration visible at a glance ✅
- "Browse Courses" CTA in empty state ✅

**Issues:**
- No sort or filter controls (all courses in enrollment order)
- No completion date shown for completed courses

---

### CourseLibrary

**Strengths:**
- Search, department filter, and status filter all work ✅
- Enrollment state clearly shown (Enroll / Continue / Review) ✅
- Progress bar visible for in-progress courses ✅

**Issues:**
- No sort controls (enrolled first, in progress, etc.)
- "Enroll" button triggers immediately with no confirmation
- Enrolled users see "Continue" but button navigates to a route that doesn't exist yet (courses need deep link)

---

### CourseDetail

**Strengths:**
- Lesson list with completion checkmarks ✅
- Block renderer handles 14 content types ✅
- Progress tracked per lesson ✅

**Issues:**
- No breadcrumb (user can't quickly return to course overview)
- Sidebar does not collapse on mobile — readability issue
- No "Mark complete and continue" affordance — users must manually select next lesson

---

### Assessments

**Strengths:**
- Course-grouped view makes hierarchy clear ✅
- Phase locking enforced with visual lock icon ✅
- Timer turns red when under 60 seconds ✅
- Question-by-question with Previous/Next ✅

**Issues:**
- "Submit" button has no confirmation dialog — easy to accidentally submit early
- No progress indicator showing how many questions answered vs total
- Result screen shows all questions but no retry breakdown explanation

---

### Certificates

**Strengths:**
- Certificate preview modal with download ✅
- Certificate ID and issue date visible ✅
- Beautiful certificate design ✅

**Issues:**
- Empty state has no CTA — users don't know they need to pass an assessment
- Download button in card list triggers download immediately without preview first
- Certificate ID is not searchable or shareable

---

### Settings

**Strengths:**
- Form fields clearly labeled ✅
- Disabled fields (email, batch) clearly marked ✅
- Save confirmation message ✅

**Issues:**
- No unsaved changes warning when navigating away mid-edit
- "Employee ID" field should probably be read-only (admin-assigned) — currently user-editable

---

### AdminPanel

**Strengths:**
- User list with role and department visible ✅

**Issues:**
- No aggregate stats for admin view (avg completion rate, etc.)
- User table not sortable or filterable beyond basic display
- No ability to message or notify employees

---

## Priority Matrix for P3

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| High | Mobile sidebar | Navigation — all users | Large |
| High | Submit assessment confirmation | Error prevention | Small |
| High | Empty dashboard guidance for new users | First-run experience | Small |
| Medium | Unsaved changes warning in Settings | Data safety | Small |
| Medium | "Mark complete and continue" in CourseDetail | Course completion flow | Medium |
| Medium | Toast notifications for mutations | System status | Small |
| Medium | Breadcrumb in CourseDetail | Navigation | Small |
| Low | Sort controls in CourseLibrary/MyCourses | Efficiency | Medium |
| Low | In-app tooltips on icon-only buttons | Accessibility + help | Small |
| Low | Admin aggregate dashboard | Admin efficiency | Medium |
