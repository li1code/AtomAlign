# AtomAlign Goal Setting & Tracking Portal - Implementation Plan

This implementation plan details the full-stack architecture and feature checklist required to complete the **AtomAlign Goal Setting & Tracking Portal** based on the execution plan and BRD/problem statement requirements.

The goal is to deliver an in-house performance alignment and quarterly progress portal featuring employee goal sheet submissions, L1 manager review workflows, shared department-level KPI synchronization, real-time analytics dashboards, automated rule-based escalations, and strict audit log tracking.

---

## User Review Required

We have identified several crucial architectural and user experience decisions to ensure high reliability and premium visual aesthetics:

> [!IMPORTANT]
> **Database Migration & Schema Sync:**
> We will update `Goal` in [schema.prisma](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/prisma/schema.prisma) to add `isShared` and `isPrimary` booleans. We must apply this schema change using Prisma DB commands (`npx prisma db push`).

> [!WARNING]
> **TypeScript Resolution Type Mismatch:**
> There are current type compilation errors in [approval.controller.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/controllers/approval.controller.ts) and [checkin.controller.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/controllers/checkin.controller.ts) because `req.params.id` is inferred as a potentially multi-valued parameter in the active Express TS configuration. We will cast these to `string` (e.g., `id as string`) to resolve all current type compilation failures.

> [!NOTE]
> **Premium Atomberg Identity Design System:**
> For the front-end, we will avoid "clunky minimum viable product" styles and create a high-fidelity dashboard using an Atomberg-inspired premium tech aesthetic:
> - Dark graphite background (`#121212` / HSL tailored slate) with sleek glassmorphic overlays.
> - Vibrant amber-yellow accents (`#FFC72C`) denoting active cycles, high performance, and alert notifications.
> - Outfit / Inter typography for readability.
> - Micro-animations for page transitions, drawer slides, and status tag updates.

---

## Open Questions

> [!IMPORTANT]
> **1. Primary Shared Goal Synchronization Trigger:**
> When the primary owner updates their quarterly achievement, should the sync occur synchronously on progress submission or asynchronously via a queue/cron check?
> *Proposed Solution:* We will sync synchronously in the [checkin.service.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/services/checkin.service.ts#L5) progress handler to ensure real-time visual accuracy for all linked employee sheets.
>
> **2. Initial Goal Cycle Setup:**
> The `Goal` model belongs to a `GoalCycle` (e.g. "FY2026"). Since cycles are managed by Admins, should we pre-seed an active Goal Cycle in the seed script so employees can start drafting goals immediately?
> *Proposed Solution:* Yes, we will enhance `prisma/seed.ts` to automatically create an active cycle starting May 1st, 2026.

---

## Proposed Changes

We will execute the implementation in priority order across three main layers: Database Schema, Backend Services/APIs, and Frontend Dashboards.

---

### 1. Database & Prisma Abstraction Layer

We will update [schema.prisma](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/prisma/schema.prisma) to support granular flags for shared goals and then apply the update.

#### [MODIFY] [schema.prisma](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/prisma/schema.prisma)
- Add `isShared Boolean @default(false)` and `isPrimary Boolean @default(false)` fields to the `Goal` model.
- Keep the existing `SharedGoal` relation intact as it is well-designed.

---

### 2. Backend Services & API Routing Layer

We will fix existing compiler errors, register an admin router, and implement the logic for shared goal synchronization, audit trails, and reporting.

#### [MODIFY] [app.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/app.ts)
- Mount the new `adminRoutes` at `/api/admin`.

#### [NEW] [admin.routes.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/routes/admin.routes.ts)
- Define and protect endpoints for admin operations:
  - `POST /api/admin/shared-goals` — Pushes a departmental KPI to list of employee IDs.
  - `POST /api/admin/goals/:id/unlock` — Unlocks an employee's approved goal sheet.
  - `GET /api/admin/escalations` — Views all triggered escalations.
  - `GET /api/admin/reports/goals` — Returns CSV data of goal alignment.
  - `GET /api/admin/reports/achievements` — Returns CSV progress reports.

#### [MODIFY] [approval.controller.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/controllers/approval.controller.ts)
- Cast `id` from `req.params` as `string` to resolve compiler type error.

#### [MODIFY] [checkin.controller.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/controllers/checkin.controller.ts)
- Cast `id` from `req.params` as `string` to resolve compiler type error.

#### [MODIFY] [checkin.service.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/services/checkin.service.ts)
- Extend `createQuarterlyUpdate` so that when a goal is updated, if `isPrimary` is `true` and `sharedGoalId` is present, it automatically propagates the `actualAchievement`, `progress`, and `status` to all other `GoalUpdate` entries corresponding to the same `sharedGoalId` and `quarter`.

#### [NEW] [analytics.service.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/backend/services/analytics.service.ts)
- Add functions to compute complex analytics:
  - `getQoQProgress()`: Computes average progress across Q1, Q2, Q3, Q4.
  - `getDepartmentLeaderboard()`: Renders completion statistics grouped by departments.
  - `getManagerLeaderboard()`: Evaluates L1 managers by their check-in completion percentages.

---

### 3. Frontend Portal & User Experience Layer

We will build an extremely premium, dynamic, and responsive Next.js frontend application with dashboards for all three personas.

#### [NEW] [adminStore.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/frontend/src/store/adminStore.ts)
- Manage admin UI state for unlock flows, escalations logs, and shared goal creation.

#### [MODIFY] [goalStore.ts](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/frontend/src/store/goalStore.ts)
- Support drafting, submitting, tracking weightages, and updating quarterly achievements.

#### [NEW] [employee/page.tsx](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/frontend/src/app/dashboard/employee/page.tsx)
- Premium dark-theme dashboard.
- Live Goal Sheet creator with active weightage tracking alerts:
  - Display green badge when total weightage = 100%, yellow if < 100%, red if > 100%.
  - Max 8 goals indicator.
- List of active goals with computed progress scores using the BRD formula engine.

#### [NEW] [manager/page.tsx](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/frontend/src/app/dashboard/manager/page.tsx)
- Clean approval queue.
- Inline target and weightage adjustments.
- Comment drawer for checking off and saving structured quarterly feedback.

#### [NEW] [admin/page.tsx](file:///c:/Users/Lenovo/Desktop/goal-tracking-portal/frontend/src/app/dashboard/admin/page.tsx)
- Modern completion heatmap with department-wise drill-downs.
- Action panel to distribute shared departmental goals.
- Action panel to resolve rule-based escalations.
- Audit log reader displaying before/after differences side-by-side.
- Quick CSV export actions.

---

## Verification Plan

We will perform comprehensive automated and manual verification to guarantee correctness.

### Automated Tests
1. **Compilation Check:**
   - Execute type checks to ensure zero typescript errors:
     ```bash
     node node_modules/typescript/bin/tsc --noEmit
     ```
2. **Database Sync Check:**
   - Push and verify schema alignment:
     ```bash
     npx prisma db push
     ```

### Manual Verification
1. **End-to-End Persona Testing:**
   - We will run the dev server and test:
     - **Employee flow:** Create 4 goals with weightage summing to 100% -> Submit -> Verify it goes to SUBMITTED status and becomes read-only.
     - **Manager flow:** View submission -> Edit weightage inline -> Approve goal -> Verify it becomes `APPROVED_LOCKED` and displays a lock icon.
     - **Shared Goal Sync:** Admin pushes shared goal -> Primary employee logs actual Q1 progress -> Verify it propagates to other employee sheets.
     - **Admin Unlock:** Admin triggers unlock with a mandatory text reason -> Verify employee can edit again and audit log tracks the reason.
