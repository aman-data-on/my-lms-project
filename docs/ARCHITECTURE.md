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
├── main.tsx              # Entry point
├── App.tsx               # Main router & layout
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
│   ├── Dashboard.tsx             # Main dashboard
│   ├── MyCourses.tsx             # Enrolled courses
│   ├── CourseLibrary.tsx         # Browse courses
│   ├── CourseDetail.tsx          # Course content viewer
│   ├── SalesOnboardingCourse.tsx # Sales-specific course
│   ├── Assessments.tsx           # Assessment list & taking
│   ├── Certificates.tsx          # Certificate management
│   ├── Reports.tsx               # Analytics & reports
│   ├── Settings.tsx              # User settings
│   ├── AdminPanel.tsx            # Admin controls
│   └── CourseBuilder.tsx         # Course editing
│
├── components/ (5 shared components)
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── BlockRenderer.tsx      # Renders content blocks
│   ├── BlockEditor.tsx        # Edits content blocks
│   ├── CourseIndex.tsx        # Course navigation index
│   └── CourseAppendix.tsx     # Course appendix section
│
├── lib/ (Business logic & services)
│   ├── supabase.ts           # Supabase client + types
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

### Current Routing

**Pattern:** Manual page switching in App.tsx (NOT React Router)

```typescript
// App.tsx route handling
const [activePage, setActivePage] = useState('dashboard');
const handleNavigate = (page: string, data?: any) => {
  setActivePage(page);
  setPageData(data || null);
};

switch (activePage) {
  case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
  case 'my-courses': return <MyCourses onNavigate={handleNavigate} />;
  case 'course-detail': return <CourseDetail courseId={data.courseId} />;
  // ... etc
}
```

**Routes Available:**
- `/` → dashboard
- `my-courses` → MyCourses
- `course-library` → CourseLibrary
- `course-detail` (with courseId) → CourseDetail
- `assessments` → Assessments
- `certificates` → Certificates
- `reports` → Reports
- `settings` → Settings
- `admin` → AdminPanel (admin only)
- `course-builder` (with editingCourseId) → CourseBuilder

**Issues Identified:**
- ⚠️ No URL-based routing (state lost on page refresh)
- ⚠️ No browser history support
- ⚠️ Not SEO-friendly
- ⚠️ No deep linking capability
- ⚠️ Difficult to share links with specific states
- ⚠️ Hard to debug route state
- ⚠️ No route guards or middleware

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
- ✅ Admin-only pages checked at UI level
- ✅ Reserved email list (admin@company.com)

**Data Access**
- ✅ Row-Level Security (RLS) enabled in Supabase
- ✅ User can only see own profile data
- ⚠️ Course data accessible to all authenticated users
- ⚠️ Enrollment restrictions not enforced at DB level

### Security Issues Found:**
- ⚠️ No input validation/sanitization
- ⚠️ No CSRF protection visible
- ⚠️ No rate limiting on auth endpoints
- ⚠️ Admin check only at UI level (should be backend)
- ⚠️ Sensitive data in localStorage (reportData)
- ⚠️ No API key rotation strategy
- ⚠️ No request signing/verification
- ⚠️ Environment variables not typed/validated
- ⚠️ No XSS protection on rich text (html2canvas usage)
- ⚠️ No SQL injection prevention documented

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

### Critical Issues
1. **No URL-based routing** - App state lost on refresh
2. **No API abstraction** - Direct Supabase calls everywhere
3. **No centralized state management** - Prop drilling, data inconsistency
4. **No error handling strategy** - Inconsistent error management
5. **Authorization at UI level only** - Security bypass risk

### High Priority Issues
6. **No component library** - No design system enforcement
7. **No loading/error states** - Poor UX during async operations
8. **LocalStorage for critical data** - Data loss risk
9. **No data caching** - Performance impact, unnecessary queries
10. **No request deduplication** - Multiple identical queries

### Medium Priority Issues
11. No lazy loading of routes
12. No performance monitoring
13. No error tracking/logging
14. Inconsistent styling patterns
15. No test infrastructure

---

## Recommendations for Phase 1 (Audit Complete)

1. **Implement React Router** - URL-based routing
2. **Create API service layer** - Abstraction over Supabase
3. **Add error boundaries** - Graceful error handling
4. **Implement loading states** - Consistent UX
5. **Create component library** - Design system compliance
6. **Add request deduplication** - Performance improvement
7. **Move critical data to DB** - Reliability improvement
8. **Add input validation** - Security hardening
9. **Implement error tracking** - Observability
10. **Add performance monitoring** - Identify bottlenecks

