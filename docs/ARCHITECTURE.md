# ARCHITECTURE REVIEW

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vite Dev Server / Build                  │
├─────────────────────────────────────────────────────────────┤
│                      React Application                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              App.tsx (Main Router)                    │  │
│  │  - AuthProvider (Context wrapper)                    │  │
│  │  - Page-based routing (manual state management)       │  │
│  │  - Sidebar navigation                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│        ┌──────────────────┼──────────────────┐               │
│        ▼                  ▼                  ▼               │
│  ┌──────────────┐ ┌────────────┐ ┌──────────────────┐       │
│  │   Pages     │ │ Components │ │   Contexts       │       │
│  │ (12 pages)  │ │  (5 cmps)  │ │ AuthContext      │       │
│  └──────────────┘ └────────────┘ └──────────────────┘       │
│        │                  │                                  │
│        └──────────────────┼──────────────────┐               │
│                           ▼                  ▼               │
│                     ┌──────────────┐   ┌──────────────┐     │
│                     │  Lib Services│   │  Utilities   │     │
│                     │ - supabase   │   │ - formatters │     │
│                     │ - reportData │   │ - validators │     │
│                     │ - blocks     │   │ - cn() util  │     │
│                     │ - utils      │   └──────────────┘     │
│                     └──────────────┘                        │
│                           │                                  │
│                           ▼                                  │
│                    ┌──────────────────┐                     │
│                    │   Tailwind CSS   │                     │
│                    │ (3.4.17)        │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              External Dependencies                           │
├─────────────────────────────────────────────────────────────┤
│  - @supabase/supabase-js (API client)                       │
│  - react-player (Video playback)                            │
│  - html2canvas + jspdf (PDF generation)                     │
│  - lucide-react (Icons)                                     │
│  - clsx + tailwind-merge (CSS utilities)                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│           Supabase Backend (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────┤
│  - Authentication (Supabase Auth)                            │
│  - Row-Level Security (RLS)                                  │
│  - Database with 10+ tables                                  │
│  - Edge Functions (seed-users)                              │
│  - Real-time subscriptions                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Application Structure

### Frontend Architecture

```
src/
├── main.tsx              # Entry point — QueryClientProvider wraps App
├── App.tsx               # BrowserRouter, route definitions, RequireAuth/RequireAdmin guards
├── index.css             # Tailwind + global styles
│
├── contexts/
│   └── AuthContext.tsx   # Authentication state management
│       ├── User state (user, loading, isAdmin)
│       ├── Auth methods (signIn, signUp, signOut)
│       ├── Session management
│       └── Profile fetching
│
├── pages/ (12 pages - route views)
│   ├── AuthPage.tsx              # Sign in/Sign up
│   ├── Dashboard.tsx             # Main dashboard (react-query)
│   ├── MyCourses.tsx             # Enrolled courses
│   ├── CourseLibrary.tsx         # Browse courses
│   ├── CourseDetail.tsx          # Course content viewer (react-query)
│   ├── SalesOnboardingCourse.tsx # Sales-specific course
│   ├── Assessments.tsx           # Assessment list & taking
│   ├── Certificates.tsx          # Certificate management
│   ├── Reports.tsx               # Analytics & reports
│   ├── Settings.tsx              # User settings
│   ├── AdminPanel.tsx            # Admin controls
│   └── CourseBuilder.tsx         # Course editing
│
├── components/ (7 shared components)
│   ├── Sidebar.tsx           # Navigation sidebar (NavLink-based)
│   ├── BlockRenderer.tsx      # Renders content blocks (DOMPurify sanitized)
│   ├── BlockEditor.tsx        # Edits content blocks (DOMPurify sanitized)
│   ├── CourseIndex.tsx        # Course navigation index
│   ├── CourseAppendix.tsx     # Course appendix section
│   └── ErrorBoundary.tsx      # Global error boundary (class component)
│
├── lib/ (Business logic & services)
│   ├── supabase.ts           # Supabase client + types
│   ├── api.ts                # Centralized Supabase service facade (Phase 1)
│   ├── sanitize.ts           # safeHtml() — DOMPurify wrapper (P1 security fix)
│   ├── blocks.ts             # Content block definitions
│   ├── reportData.ts         # LocalStorage data helpers
│   └── utils.ts              # Formatting utilities
│
└── tsconfig.json & tsconfig.node.json
```

---

## State Management

### Current State Management Pattern

**Architecture:** Manual state management using React hooks

**Authentication State (AuthContext)**
```typescript
AuthContext {
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
  signIn(email, password)
  signUp(data)
  signOut()
  refreshUser()
}
```

**Component State (useState hooks)**
- Each page manages its own local state
- Navigation state via App.tsx (activePage, pageData)
- No centralized state management library

**Data Fetching**
- Direct Supabase client calls in useEffect hooks
- LocalStorage for analytics data (login history, lesson completions, course progress)
- No caching or query management layer

**Issues Identified:**
- ⚠️ No centralized state management (prop drilling potential)
- ⚠️ Duplicate API calls across pages
- ⚠️ No loading/error state standardization
- ⚠️ LocalStorage data can be lost (unreliable for critical data)
- ⚠️ No data synchronization mechanism
- ⚠️ Complex prop passing through deep component trees

---

## Routing Architecture

### Current Routing (Phase 1 — React Router v6)

**Pattern:** React Router v6 with `<Routes>`/`<Route>`, URL-based navigation via `useNavigate`, and route guards.

```typescript
// App.tsx — RouteWrappers component
<Routes>
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/" element={<RequireAuth><Dashboard onNavigate={mapNavigate} /></RequireAuth>} />
  <Route path="/my-courses" element={<RequireAuth><MyCourses onNavigate={mapNavigate} /></RequireAuth>} />
  <Route path="/course-library" element={<RequireAuth><CourseLibrary onNavigate={mapNavigate} /></RequireAuth>} />
  <Route path="/course/:courseId" element={<RequireAuth><CourseRouteWrapper onNavigate={mapNavigate} /></RequireAuth>} />
  <Route path="/assessments" element={<RequireAuth><Assessments onNavigate={mapNavigate} /></RequireAuth>} />
  <Route path="/certificates" element={<RequireAuth><Certificates /></RequireAuth>} />
  <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
  <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
  <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminPanel onNavigate={mapNavigate} /></RequireAdmin></RequireAuth>} />
  <Route path="/course-builder" element={<RequireAuth><RequireAdmin><CourseBuilder onNavigate={mapNavigate} /></RequireAdmin></RequireAuth>} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Route Guards:**
- `RequireAuth` — checks `user` from `AuthContext`; redirects unauthenticated users to `/auth`.
- `RequireAdmin` — checks `isAdmin` from `AuthContext`; redirects non-admin authenticated users to `/`.

**Routes Available:**
- `/` → Dashboard (auth required)
- `/my-courses` → MyCourses (auth required)
- `/course-library` → CourseLibrary (auth required)
- `/course/:courseId` → CourseDetail or SalesOnboardingCourse (auth required; special-cased by ID)
- `/assessments` → Assessments (auth required)
- `/certificates` → Certificates (auth required)
- `/reports` → Reports (auth required)
- `/settings` → Settings (auth required)
- `/admin` → AdminPanel (auth + admin required)
- `/course-builder` → CourseBuilder (auth + admin required)
- `*` → redirect to `/`

**Note:** Pages still receive an `onNavigate` adapter prop for legacy compatibility. This can be removed incrementally as pages adopt `useNavigate` directly.

---

## Data Flow

### Authentication Flow
```
User Login Form (AuthPage)
  ↓
signIn(email, password) [AuthContext]
  ↓
supabase.auth.signInWithPassword()
  ↓
onAuthStateChange listener
  ↓
fetchProfile(userId)
  ↓
setUser() [AuthContext state]
  ↓
App renders dashboard & sidebar
```

### Course Enrollment & Progress Flow
```
User views course (CourseDetail)
  ↓
useEffect fetches course data from supabase
  ↓
Display course blocks & lessons
  ↓
User completes lesson
  ↓
Update enrollments table (progress_percent)
  ↓
Update lesson_progress table
  ↓
LocalStorage updated (lessonCompletions, courseProgress)
  ↓
Dashboard stats updated
```

### Assessment Flow
```
User starts assessment (Assessments page)
  ↓
Fetch questions from database
  ↓
Display questions with options
  ↓
User submits answers
  ↓
Calculate score
  ↓
Create assessment_attempts record
  ↓
Generate certificate if passing
  ↓
Update enrollments progress
```

---

## API Layer (Supabase)

### Client Setup
```typescript
// supabase.ts
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
```

### Direct API Calls Pattern
**Issue:** No abstraction layer between components and Supabase

```typescript
// Example from multiple pages
const { data, error } = await supabase
  .from('courses')
  .select('*')
  .eq('department', dept);

// Same pattern repeated across 12 pages
// No error handling standardization
// No loading state management
// No request deduplication
```

### Database Tables
- **profiles** - User data
- **courses** - Course metadata
- **lessons** - Course lessons
- **enrollments** - Enrollment tracking
- **lesson_progress** - Lesson completion
- **assessments** - Assessment definitions
- **questions** - Assessment questions
- **assessment_attempts** - User attempts
- **certificates** - Certificates issued
- **phase_progress** - Course phases

### Authentication Strategy
- Supabase Auth (email/password)
- Row-Level Security (RLS) enabled
- Session-based authentication
- Seed users via Edge Function (seed-users)

### Issues Identified:**
- ⚠️ No API abstraction layer
- ⚠️ Inconsistent error handling
- ⚠️ No request retry logic
- ⚠️ No rate limiting consideration
- ⚠️ Direct table access (no stored procedures)
- ⚠️ N+1 query problems potential
- ⚠️ No caching strategy

---

## Component Architecture

### Component Hierarchy
```
App (root)
├── AuthProvider (context)
├── AuthPage (or main app)
│   ├── Sidebar
│   │   └── Nav items (+ logout)
│   └── Main content (one of 12 pages)
│       └── Various page components
│           └── BlockRenderer (for course content)
│           └── BlockEditor (for course builder)
│           └── CourseIndex/Appendix (navigation)
```

### Component Props Flow
```
App.tsx
  ├── onNavigate prop → Sidebar, all Pages
  ├── pageData prop → Pages that need data
  └── activePage prop → Sidebar
```

### Page Components (12)
1. **AuthPage** - 200+ lines, sign in/up form
2. **Dashboard** - Stats, continue course, activity feed
3. **MyCourses** - Enrolled courses list
4. **CourseLibrary** - Browse all courses
5. **CourseDetail** - Course content viewer with blocks
6. **SalesOnboardingCourse** - Special sales course
7. **Assessments** - Assessment list & quiz taker
8. **Certificates** - Certificate management
9. **Reports** - Analytics dashboard
10. **Settings** - User settings
11. **AdminPanel** - Admin dashboard
12. **CourseBuilder** - Course editor with block system

### Shared Components (5)
1. **Sidebar** - Main navigation (responsive mobile menu)
2. **BlockRenderer** - Renders 14 different content block types
3. **BlockEditor** - Edits content blocks
4. **CourseIndex** - Course navigation TOC
5. **CourseAppendix** - Additional course resources

---

## Block System Architecture

### 14 Block Types
```
1. text              - Rich text blocks
2. callout           - Info boxes
3. key_takeaway      - Highlighted takeaways
4. learning_objectives - Course objectives
5. stat_card         - Statistics display
6. two_column        - 2-column layout
7. accordion         - FAQ/collapsible content
8. image_caption     - Images with captions
9. knowledge_check   - Inline quizzes
10. checklist        - Task checklists
11. quote            - Quoted content
12. timeline         - Timeline visualization
13. flashcard        - Flashcard pairs
14. download_resource - Downloadable resources
```

### Block Data Structure
```typescript
interface BlockBase {
  id: string;
  type: BlockType;
  data: Record<string, any>; // Type-specific data
}

// Example: Text block
{ id: 'block-...', type: 'text', data: { html: '<p>...' } }

// Example: Accordion
{ 
  id: 'block-...', 
  type: 'accordion', 
  data: { items: [{ question: '...', answer: '...' }] } 
}
```

---

## Security Architecture

### Current Security Implementation

**Authentication**
- ✅ Email/password authentication via Supabase
- ✅ Session-based with Supabase Auth
- ✅ Automatic session refresh

**Authorization**
- ✅ Role-based access control (admin/employee)
- ✅ Admin-only routes guarded by `RequireAdmin` at route level (P1 fix — `dd2a930`)
- ✅ Admin-only routes additionally guarded by `RequireAuth` (session check before role check)
- ✅ Reserved email list (`RESERVED_EMAILS` in `AuthContext.tsx:36`)

**XSS Prevention**
- ✅ All `dangerouslySetInnerHTML` callsites sanitized via `safeHtml()` in `src/lib/sanitize.ts` (P1 fix — `3d3d125`)
- ✅ DOMPurify with `USE_PROFILES: { html: true }` — strips script tags, event handlers, and dangerous attributes

**Data Access**
- ✅ Row-Level Security (RLS) enabled in Supabase
- ✅ User can only see own profile data
- ⚠️ Course data accessible to all authenticated users
- ⚠️ Enrollment restrictions not enforced at DB level

**Remaining Security Issues:**
- ⚠️ No CSRF protection visible
- ⚠️ No rate limiting on auth endpoints
- ⚠️ `profiles.role` self-write not blocked at DB level — requires RLS policy (see CHANGELOG P1 Fix 3 for exact SQL)
- ⚠️ Sensitive data in localStorage (reportData)
- ⚠️ No API key rotation strategy
- ⚠️ No request signing/verification
- ⚠️ Environment variables not typed/validated

---

## Performance Architecture

### Current Performance Approach

**Bundle Management**
- Vite for code splitting (default)
- No explicit lazy loading visible
- All 12 pages loaded upfront
- Lucide icons tree-shakeable (good)

**Rendering Optimization**
- ⚠️ No React.memo on components
- ⚠️ No useMemo hooks visible
- ⚠️ No useCallback hooks visible
- ⚠️ Potential unnecessary re-renders

**Data Loading**
- Direct Supabase queries (no pagination visible)
- No data caching strategy
- LocalStorage for some data (offline support weak)
- No request deduplication
- `Dashboard.tsx` has now been migrated to `@tanstack/react-query` using a centralized `fetchDashboardData()` wrapper, introducing query caching and request deduplication for dashboard data.

**Assets**
- ⚠️ No image optimization visible
- ⚠️ No font optimization
- ⚠️ No CSS minification configured
- ⚠️ No asset compression visible

---

## Deployment Architecture

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
})
```

**Build Command:** `tsc && vite build`
- TypeScript compilation
- Vite bundle creation

**Environment Setup**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

**Issues:**
- ⚠️ No build optimization configs
- ⚠️ No environment variable validation
- ⚠️ No build output analysis
- ⚠️ No deployment configuration visible

---

## Key Architectural Issues

### Resolved (P1 complete)
- ~~**No URL-based routing**~~ → React Router v6 with `RequireAuth` + `RequireAdmin` guards (Phase 1, P1)
- ~~**XSS via unsanitized HTML**~~ → DOMPurify `safeHtml()` at all `dangerouslySetInnerHTML` sites (P1 `3d3d125`)
- ~~**No error boundary**~~ → Global `ErrorBoundary` wrapping `AuthProvider` (P1 `4eb9b45`)
- ~~**Authorization at UI level only**~~ → Route-level `RequireAdmin` guard added (P1 `dd2a930`)

### Critical Issues (open)
1. **No API abstraction** - Direct Supabase calls in most pages (partial: api.ts + react-query for Dashboard/CourseDetail)
2. **`profiles.role` self-write not blocked at DB level** - Requires RLS policy (see CHANGELOG P1 Fix 3)
3. **No centralized state management** - Prop drilling, data inconsistency across most pages

### High Priority Issues (open)
4. **No component library** - No design system enforcement
5. **No loading/error states** - Poor UX during async operations (partially resolved by react-query on Dashboard + CourseDetail)
6. **LocalStorage for critical data** - Data loss risk
7. **No data caching** - Most pages still fetch without caching

### Medium Priority Issues (open)
8. No lazy loading of routes
9. No performance monitoring
10. No error tracking/logging (ErrorBoundary stubs `Sentry.captureException` — Phase 5)
11. Inconsistent styling patterns
12. No test infrastructure

---

## Recommendations for Phase 2 (Next)

1. **Create API service layer** - Migrate remaining pages to `src/lib/api.ts` + react-query
2. **Lazy-load heavy dependencies** - `jspdf` + `html2canvas` only on Certificates page
3. **Code splitting** - Route-level `React.lazy` + `Suspense`
4. **Apply `profiles.role` RLS policy** - Database operator task (SQL in CHANGELOG P1 Fix 3)

