# Product Decisions

> Rationale behind key product feature decisions in the Employee Onboarding LMS.
> Each entry captures the decision, the alternatives considered, and why we chose what we did.

---

## PD-001: Phase-gated Assessments for Sales Onboarding

**Decision:** Sales course assessments are locked sequentially. A learner must pass Phase 1 before unlocking Phase 2, and Phase 2 before Phase 3.

**Alternatives considered:**
- Allow all assessments unlocked from day 1
- Gate by time (unlock after N days), not by passing

**Reasoning:** The Sales onboarding curriculum is deliberately sequential — each phase builds on the last. Allowing learners to skip ahead results in poor retention of Phase 3 material and higher failure rates. Phase-locking enforces the intended learning progression.

**Implementation:** `SALES_COURSE_ID` and `SALES_ASSESSMENT_ORDER` constants in `api.ts`. `submitAssessment()` conditionally writes `phase_progress` for Sales only; lock state computed in UI from `phase_progress`.

---

## PD-002: Assessment Attempts Are Not Retryable

**Decision:** Once an assessment is submitted, the user cannot retake it. The result is final.

**Alternatives considered:**
- Allow N retakes, record best score
- Allow unlimited retakes with a cooldown period

**Reasoning:** Retakes are an admin-configurable future feature, but the current MVP for internal onboarding assumes assessments are sat once. Unlimited retakes reduces their validity as a completion signal. Admin retake unlock can be added in P4 without breaking the current data model.

**Data model impact:** `assessment_attempts` table stores all attempts per user per assessment. Multiple attempts are already supported structurally — the current UI simply doesn't expose the retake affordance.

---

## PD-003: Certificates Generated Client-Side with jsPDF

**Decision:** Certificate PDFs are generated in the browser using jsPDF + html2canvas, not server-side.

**Alternatives considered:**
- Server-side rendering with Puppeteer in a Supabase edge function
- Pre-generated PDFs stored in Supabase Storage

**Reasoning:** Client-side generation removes the need for a PDF generation service and storage infrastructure. For an internal tool with moderate concurrent users, browser-based rendering is sufficient. The jsPDF bundle (~560KB) is deferred via lazy loading, so it does not affect initial load.

**Trade-off:** Certificate layout quality is lower than server-side rendering (no custom fonts, no pixel-perfect alignment). This is acceptable for an internal onboarding tool.

---

## PD-004: Department-based Course Grouping

**Decision:** Courses are tagged with a `department` field and filtered by department in CourseLibrary.

**Alternatives considered:**
- Tag-based taxonomy with many-to-many tags
- Topic-based categories distinct from org departments

**Reasoning:** The primary use case is "show me courses relevant to my department." Sharing the `department` field across users and courses enables instant filtering without a join table. Tags or topics would add schema complexity without meaningful benefit for the current user count.

---

## PD-005: Single Supabase Project for All Environments

**Decision:** Development, testing, and production all share one Supabase project (`cthnljvcfnzxluedquxf`).

**Alternatives considered:**
- Separate dev and prod projects
- Local Supabase for development

**Reasoning:** For a small internal team in early development, maintaining separate environments adds operational overhead that isn't justified. Test users are seeded via an edge function rather than interfering with real data.

**Risk:** Schema changes applied directly to the production database. Mitigated by the migration-based workflow (`supabase migrations`) and the fact that the user base is internal and small.

**Action:** Create a staging project before first external launch (P4 milestone).

---

## PD-006: No Analytics or Tracking in MVP

**Decision:** No analytics SDK (PostHog, Mixpanel, etc.) in the current build.

**Alternatives considered:**
- PostHog with privacy-first config from day one
- Basic custom event logging to a Supabase table

**Reasoning:** The product is pre-launch, internal-only, and user counts are small enough that manual feedback and Supabase logs are sufficient. Adding analytics prematurely creates GDPR/privacy work before the tool has any external users.

**Revisit at:** P4 (first external or regulated deployment).

---

## PD-007: RLS as Primary Authorization Layer

**Decision:** Row-Level Security in Supabase, not application-level guards, is the authoritative access control mechanism.

**Alternatives considered:**
- Application-level checks only (check `role === 'admin'` in component)
- Edge function middleware for all data access

**Reasoning:** RLS is enforced at the database layer and cannot be bypassed by a compromised client. Application-level guards are defense-in-depth only. All tables have RLS policies; the application guards are UX (hiding admin nav) rather than security controls.
