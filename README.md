# AtomAlign — In-House Goal Setting & Tracking Portal

> Full-stack TypeScript · PostgreSQL · Next.js 15
>
> **Live Demo:** [atom-align-lovat.vercel.app](https://atom-align-lovat.vercel.app)

---

AtomAlign is a production-grade, role-aware Goal Setting & Tracking Portal that manages the complete lifecycle of employee goals — from draft submission and manager approval to quarterly check-ins and audit-ready governance. Built to replace the spreadsheet-and-email model with a system that enforces alignment, not just records it.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
│          Next.js 15 (Turbopack) · Tailwind · shadcn/ui      │
│    Zustand State · Axios · Custom Hooks · Route Guards       │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│                       API Layer                             │
│              Node.js / Express · TypeScript                  │
│     JWT Auth · Role Middleware · Zod Validation · Prisma     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Data Layer                              │
│              PostgreSQL · Prisma ORM · AuditLog              │
└─────────────────────────────────────────────────────────────┘
```

**Runtime:** Backend on port `5000` (ts-node-dev) · Local frontend on port `3000` (Turbopack) · deployed on Vercel

---

## Tech Stack

| Layer            | Technology                                                         |
| ---------------- | ------------------------------------------------------------------ |
| Language         | TypeScript (end-to-end)                                            |
| Frontend         | Next.js 15, Tailwind CSS, shadcn/ui                                |
| State Management | Zustand (`authStore`, `goalStore`)                                 |
| HTTP Client      | Axios (configured in `lib/axios.ts`)                               |
| Backend          | Node.js, Express                                                   |
| Validation       | Zod (schema-level, frontend + backend)                             |
| ORM              | Prisma                                                             |
| Database         | PostgreSQL                                                         |
| Auth             | Stateless JWT, role-persisted sessions · bcrypt credential hashing |
| Deployment       | Vercel (frontend)                                                  |

---

## Repository Structure

```
AtomAlign/
├── backend/
│   └── src/
│       ├── config/              # DB connection, env parsing
│       │   ├── db.ts
│       │   └── env.ts
│       ├── controllers/         # Route handlers per domain
│       │   ├── auth.controller.ts
│       │   ├── goal.controller.ts
│       │   ├── checkin.controller.ts
│       │   ├── analytics.controller.ts
│       │   └── admin.controller.ts
│       ├── services/            # Business logic layer
│       │   ├── auth.service.ts
│       │   ├── goal.service.ts
│       │   ├── checkin.service.ts
│       │   ├── analytics.service.ts
│       │   └── escalation.service.ts
│       ├── routes/              # Express routers
│       │   ├── auth.routes.ts
│       │   ├── goal.routes.ts
│       │   ├── checkin.routes.ts
│       │   ├── analytics.routes.ts
│       │   └── admin.routes.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts      # JWT verification
│       │   ├── role.middleware.ts      # RBAC enforcement
│       │   ├── error.middleware.ts     # Global error handler
│       │   └── validation.middleware.ts
│       ├── utils/
│       │   ├── jwt.ts
│       │   ├── validators.ts
│       │   ├── progressEngine.ts      # UoM scoring logic
│       │   ├── auditLogger.ts         # Post-lock change tracking
│       │   └── response.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── app.ts
│       └── server.ts
│
├── frontend/
│   └── src/
│       ├── app/                        # Next.js App Router
│       │   ├── (auth)/login/
│       │   ├── dashboard/
│       │   │   ├── employee/
│       │   │   ├── manager/
│       │   │   └── admin/
│       │   ├── goals/
│       │   │   ├── create/
│       │   │   └── [id]/
│       │   ├── checkins/
│       │   ├── analytics/
│       │   └── audit-logs/
│       ├── components/
│       │   ├── ui/                     # shadcn/ui base components
│       │   ├── dashboard/
│       │   │   ├── StatCard.tsx
│       │   │   ├── ProgressChart.tsx
│       │   │   ├── GoalCard.tsx
│       │   │   └── ActivityFeed.tsx
│       │   ├── goals/
│       │   │   ├── GoalForm.tsx        # Dynamic add/remove goal rows
│       │   │   ├── GoalTable.tsx
│       │   │   ├── GoalStatusBadge.tsx
│       │   │   └── WeightageTracker.tsx # Live 100% progress widget
│       │   ├── checkins/
│       │   └── layout/
│       │       ├── Sidebar.tsx         # Collapsible icon rail (68px) / expanded (240px)
│       │       ├── Navbar.tsx
│       │       └── DashboardShell.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useGoals.ts
│       │   └── useCheckins.ts
│       ├── lib/
│       │   ├── axios.ts
│       │   ├── validators.ts          # Zod schemas (mirrors backend)
│       │   ├── constants.ts
│       │   └── progressEngine.ts      # Client-side score preview
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── goal.service.ts
│       │   ├── checkin.service.ts
│       │   └── analytics.service.ts
│       ├── store/
│       │   ├── authStore.ts
│       │   └── goalStore.ts
│       ├── types/
│       │   ├── auth.ts
│       │   ├── goals.ts
│       │   └── analytics.ts
│       └── middleware.ts              # Client-side route guards
│
├── .gitignore
└── README.md
```

---

## Core Modules

### Authentication & RBAC

JWT-based stateless auth with three roles: `EMPLOYEE`, `MANAGER`, `ADMIN`. Every API route is guarded by `auth.middleware.ts` (token verification) followed by `role.middleware.ts` (permission scoping). On the frontend, `middleware.ts` enforces client-side route guards, and `useAuth.ts` exposes the Zustand-backed auth state across the app.

Password changes are handled via a dedicated `PUT /api/auth/change-password` endpoint. Credentials are verified and rewritten using `bcrypt` hashing on the Node.js backend — plaintext passwords are never persisted or compared directly.

### UI & Layout System

The interface is locked to a clean, premium light-mode aesthetic — enforced at the theme architecture level via the `L` class selector. Toggle controls have been removed from all navigation and settings pages to maintain brand consistency.

- **Color palette:** `#F4F4F0` warm-neutral backgrounds · white card surfaces · high-contrast borders · `#FFB800` amber accent highlights
- **Typography:** All placeholder text and body fonts use elevated contrast levels for maximum readability
- **Sidebar:** Fully responsive collapsible navigation that toggles between an icon rail (`68px`) and an expanded panel (`240px`) with tooltip support at all widths
- **Header:** Role indicator, active page title, and a user action dropdown for profile and account settings

### Goal Lifecycle Engine

Goals follow a strict state machine: `DRAFT → SUBMITTED → APPROVED (LOCKED)` or `DRAFT (returned for rework)`.

Validation enforced by Zod on both layers:

- Weightage per goal: **≥ 10%**
- Total weightage across all goals: **= 100%** (exact)
- Goals per employee per cycle: **≤ 8**

`GoalForm.tsx` handles dynamic goal rows with a live `WeightageTracker.tsx` widget so employees see their running total before submission. On the manager side, the approval queue allows inline edits to targets and weightages before locking.

### Progress Scoring Engine (`progressEngine.ts`)

Exists on both backend (`utils/`) and frontend (`lib/`) for server-computed scores and client-side previews respectively.

| UoM Type                      | Formula                      | Use Case             |
| ----------------------------- | ---------------------------- | -------------------- |
| `NUMERIC_MIN` / `PERCENT_MIN` | `Achievement ÷ Target`       | Revenue, Sales       |
| `NUMERIC_MAX` / `PERCENT_MAX` | `Target ÷ Achievement`       | TAT, Cost, Attrition |
| `TIMELINE`                    | Completion date vs. Deadline | Project delivery     |
| `ZERO_BASED`                  | `0 → 100%`, else `0%`        | Safety incidents     |

### Quarterly Check-in Module

System-enforced update windows. Employees log actuals; managers add structured check-in comments via the check-in controller. All interactions are scoped to the active quarter.

| Period       | Window        | Action                          |
| ------------ | ------------- | ------------------------------- |
| Goal Setting | 1st May       | Creation, Submission & Approval |
| Q1           | July          | Planned vs. Actual              |
| Q2           | October       | Planned vs. Actual              |
| Q3           | January       | Planned vs. Actual              |
| Q4 / Annual  | March / April | Final Achievement Capture       |

### Audit & Governance Layer

`auditLogger.ts` intercepts all goal mutations that occur post-lock and writes to the `AuditLog` table — capturing actor, field changed, old value, new value, and timestamp. The Admin dashboard surfaces these logs in `app/audit-logs/` and exposes completion-rate heatmaps via `analytics.service.ts`.

### Escalation Service (`escalation.service.ts`)

Goals sitting in a manager's approval queue for **> 7 days** are automatically escalated to Admin. The Admin governance dashboard includes a manual sweep trigger for ad-hoc escalation runs alongside real-time system stats (submission rates, active escalations, employee count).

### Shared Goals

Admins or managers can push a departmental KPI to multiple employees simultaneously. Recipients can only modify weightage — title and target are read-only. Achievement entries by the primary owner propagate to all linked goal sheets via the goal service.

---

## API Routes

| Domain    | Prefix           | Controller                |
| --------- | ---------------- | ------------------------- |
| Auth      | `/api/auth`      | `auth.controller.ts`      |
| Goals     | `/api/goals`     | `goal.controller.ts`      |
| Check-ins | `/api/checkins`  | `checkin.controller.ts`   |
| Analytics | `/api/analytics` | `analytics.controller.ts` |
| Admin     | `/api/admin`     | `admin.controller.ts`     |

### Notable Endpoints

- `PUT /api/auth/change-password` — bcrypt-secured credential update, connected to the account settings page

---

## Local Setup

**Prerequisites:** Node.js v18+, PostgreSQL instance running.

```bash
# Clone
git clone https://github.com/li1code/AtomAlign.git
cd AtomAlign

# Backend
cd backend
npm install
cp .env.example .env          # Set DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npx prisma db seed            # Seed demo users across all 3 roles
npm run dev                   # http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

### Demo Credentials

| Role     | Email                  | Password      |
| -------- | ---------------------- | ------------- |
| Employee | employee@atomalign.com | `password123` |
| Manager  | manager@atomalign.com  | `password123` |
| Admin    | admin@atomalign.com    | `password123` |

---
