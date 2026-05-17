# AtomQuest Goal Tracking Portal Walkthrough

The AtomQuest Goal Tracking Portal is now fully developed, connected to Supabase Postgres backend via Prisma, and running seamlessly!

Here is a summary of all completed implementation phases:

## 1. Authentication & Role-Based Access Control (RBAC)
- **Backend Auth Service & Controller**: Stateless JWT authentication with `/login` and `/me` routes.
- **Middleware**: Guarding all API endpoints using roles `EMPLOYEE`, `MANAGER`, and `ADMIN`.
- **Frontend Auth & State**: Zustand-based store (`authStore.ts`), unified hook (`useAuth.ts`), and secure clientside router guards.
- **Atomberg Aesthetics Login UI**: High-fidelity dark mode with clean whitespace and Atomberg yellow branding accents.

## 2. Dynamic Goal Creation & Strict Weightage Rules
- **Constraint Engines & Validators**: Strictly validating Zod schema on backend and frontend:
  - Weightage of each goal must be $\ge 10\%$.
  - Total combined weightage of all goals must equal exactly $100\%$.
  - Maximum of 8 goals per cycle.
- **GoalForm Component**: A gorgeous dynamic form allowing employees to add, edit, and remove goals live, with a progress weightage tracker widget.

## 3. Manager Approval & Inline Editing Queue
- **Approval Engine**: Managers can view pending goal sheets, submit inline comments, and either Approve & Lock them or reject them back to DRAFT.
- **Audit Logging**: Any goal updates after locking are systematically audited in `AuditLog` table.

## 4. Quarterly Tracking & Progress Calculations
- **UoM Progress Engine**: Calculating completion rates dynamically based on UoM types:
  - `NUMERIC_MIN` / `PERCENT_MIN` (Higher is better)
  - `NUMERIC_MAX` / `PERCENT_MAX` (Lower is better)
  - `TIMELINE` / `ZERO_BASED`
- **Employee Tracking Card**: Direct form logging of quarterly actual numbers.

## 5. Escalation & System Analytics
- **Escalation Job**: Auto-escalates goals pending manager action for $> 7$ days to the system Admin.
- **Admin Governance Dashboard**: Includes total system stats (submission rates, total employee count, active escalations) and a trigger button to execute system sweep jobs.

---

### Local Environments Started:
- **Backend (Port 5000)**: `npm run dev` running on ts-node-dev.
- **Frontend (Port 3000)**: Next.js + Tailwind dev server running with Turbopack.
