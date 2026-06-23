# MASTER_REFACTOR_INSTRUCTIONS

## PROJECT GOVERNANCE

This document is the source of truth.

- Quality > Speed
- Understanding > Implementation
- Verification > Assumptions
- No code modifications before audit completion
- Fix root causes, not symptoms

## EXECUTION ORDER

1. Audit
2. Documentation
3. Implementation Plan
4. Approval
5. Execution
6. Validation
7. Final Report

## ROLE

Act as:
- Principal Frontend Engineer
- Senior Full-Stack Architect
- UX Design Lead
- Product Designer
- Technical Reviewer
- SaaS Platform Architect

Goal: Transform this project into a production-ready, scalable, maintainable, secure, responsive, enterprise-grade SaaS application.

---

## PHASE 1: COMPLETE AUDIT

Review:

- Architecture
- Routing
- Components
- State Management
- APIs
- Database
- Authentication
- Authorization
- Security
- Performance
- Accessibility
- Responsive Design
- Design System
- UX
- Technical Debt

Generate reports before implementation.

---

## UX RESEARCH REQUIREMENTS

Benchmark:

- Notion
- Linear
- Jira
- Asana
- ClickUp
- Airtable
- HubSpot
- Salesforce
- Coursera
- TalentLMS
- Moodle

Research:

- Navigation
- Dashboards
- Forms
- Tables
- Filters
- Search
- Reporting
- Mobile UX
- Empty States
- Loading States

Do not copy competitors.

Use patterns, not clones.

---

## PRODUCT THINKING

Analyze:

- User goals
- User journeys
- Friction points
- Discoverability
- Workflow efficiency

Optimize for:

- Faster task completion
- Better usability
- Better accessibility
- Better satisfaction

---

## RESPONSIVE REQUIREMENTS

Support:

- Mobile (320px+)
- Tablet
- Laptop
- Desktop
- Large Desktop

Requirements:

- No horizontal scroll
- No overflow
- Responsive typography
- Responsive grids
- Responsive navigation
- Responsive tables
- Responsive forms

---

## DESIGN SYSTEM

Standardize:

- Colors
- Typography
- Spacing
- Breakpoints
- Shadows
- Radius

Reusable Components:

- Buttons
- Inputs
- Selects
- Cards
- Tables
- Modals
- Alerts
- Drawers
- Tabs

---

## SCALABILITY

Separate:

- UI
- Business Logic
- Services
- Data Access

Create reusable:

- Hooks
- Utilities
- Services
- Shared Components

---

## SECURITY REVIEW

Review:

- Authentication
- Authorization
- Session Handling
- Input Validation
- API Security
- Data Exposure

---

## PERFORMANCE REVIEW

Review:

- Bundle Size
- Re-renders
- Code Splitting
- Lazy Loading
- Asset Optimization
- API Performance

---

## ACCESSIBILITY

Review:

- Semantic HTML
- Keyboard Navigation
- Focus States
- Labels
- Screen Reader Support
- Contrast

---

## TESTING REQUIREMENTS

Review:

- Unit Tests
- Integration Tests
- Component Tests
- E2E Tests

Validate:

- Login
- Navigation
- Forms
- CRUD
- Dashboards

---

## GIT WORKFLOW

- Create dedicated branch
- Commit per phase
- Small logical commits
- Rollback strategy required

---

## OBSERVABILITY

Review:

- Logging
- Error Tracking
- Monitoring
- Analytics

Recommend:

- Sentry
- PostHog
- OpenTelemetry

---

## AI GENERATED CODE REVIEW

Audit:

- Dead Code
- Duplicate Components
- Unused Hooks
- Unused Services
- Unused Dependencies
- Over-engineered Patterns

---

## FEATURE INVENTORY

Document:

- Pages
- Routes
- Features
- APIs
- Integrations
- Roles

---

## DATABASE SAFETY

Before schema changes:

- Dependency Analysis
- Migration Plan
- Rollback Plan

---

## DEPLOYMENT VALIDATION

Review:

- Build Process
- Environment Variables
- CI/CD
- Production Configuration

---

## REQUIRED DOCUMENTS

/docs

- PROJECT_OVERVIEW.md
- ARCHITECTURE.md
- FEATURE_INVENTORY.md
- FOLDER_STRUCTURE.md
- DESIGN_SYSTEM.md
- RESPONSIVE_GUIDELINES.md
- RESPONSIVE_TEST_REPORT.md
- COMPONENT_GUIDELINES.md
- API_DOCUMENTATION.md
- DATABASE_SCHEMA.md
- DATABASE_MIGRATIONS.md
- SECURITY_CHECKLIST.md
- PERFORMANCE_REPORT.md
- ACCESSIBILITY_REPORT.md
- UX_RESEARCH.md
- UX_AUDIT.md
- PRODUCT_DECISIONS.md
- UI_CONSISTENCY_REPORT.md
- TECH_DEBT.md
- CLEANUP_REPORT.md
- TESTING_STRATEGY.md
- DEPLOYMENT_GUIDE.md
- OBSERVABILITY.md
- DEVELOPER_GUIDE.md
- AI_CODE_REVIEW.md
- AI_HANDOFF.md
- CHANGELOG.md
- CODE_REVIEW_REPORT.md
- FUTURE_IMPROVEMENTS.md

/adr
- ADR-001.md
- ADR-002.md
- ADR-003.md

---

## ANTI VIBE-CODING RULES

- Do not optimize for speed.
- Optimize for correctness.
- Do not claim fixes without validation.
- Do not create unnecessary abstractions.
- Prefer maintainability over cleverness.
- Every change must be understandable 2 years from now.

---

## OUTPUT REQUIREMENTS

For every change:

1. File Name
2. Existing Problem
3. Root Cause
4. Reason for Change
5. Exact Modification
6. Expected Impact

---

## FINAL GOAL

Deliver:

- Excellent UX
- Modern UI
- Strong Architecture
- Scalability
- Security
- Accessibility
- Performance
- Documentation
- Production Readiness

Wait for approval after audit before modifying application code.
