ATOMALIGN FINAL EXECUTION PLAN

Based on BRD requirements

PRIORITY ORDER

1. Shared Goals Engine
2. Audit Trail Diff System
3. Escalation Engine
4. Analytics Module
5. Smart Validation System
6. Goal Lifecycle Visualization
7. Admin Unlock Flow
8. Enterprise Seed Data
9. Export Reports
10. Manager Review Workflow
    PHASE 1 — SHARED GOALS ENGINE
    ETA: 3 Hours
    Backend
    Prisma
    model SharedGoal {
    id String @id @default(cuid())

masterGoalId String
linkedGoalId String

masterGoal Goal @relation("MasterGoal", fields: [masterGoalId], references: [id])
linkedGoal Goal @relation("LinkedGoal", fields: [linkedGoalId], references: [id])

createdAt DateTime @default(now())
}
Goal Model Updates
isShared Boolean @default(false)
isPrimary Boolean @default(false)
API
Create Shared Goal
POST /admin/shared-goals
Sync Shared Goal
PATCH /goals/:id/sync
Business Rules
Editable
weightage
Read-only
title
target
description
Sync Logic
await prisma.goal.updateMany({
where: {
masterGoalId: goal.id
},
data: {
actual,
progress,
status
}
})
Frontend
Components
SharedGoalBadge.tsx
SharedGoalCard.tsx
PHASE 2 — AUDIT TRAIL DIFF SYSTEM
ETA: 2 Hours
Prisma
model AuditLog {
id String @id @default(cuid())

entityType String
entityId String
action String

oldValue Json?
newValue Json?

performedBy String

createdAt DateTime @default(now())
}
Utility
File
utils/auditLogger.ts
Helper
createAuditLog({
entityType,
entityId,
action,
oldValue,
newValue,
performedBy
})
Trigger Events
goal update
weightage update
approval
rejection
unlock
quarterly update
Frontend
Components
AuditDiffCard.tsx
AuditTimeline.tsx
Admin View
Weightage

- 30%

* 40%
  PHASE 3 — ESCALATION ENGINE
  ETA: 2 Hours
  Install
  npm install node-cron
  Service
  services/escalation.service.ts
  Rules
  Conditions
  goal not submitted
  approval pending > 7 days
  quarterly update overdue
  Cron
  cron.schedule("0 \* \* \* \*", async () => {
  await runEscalationSweep()
  })
  API
  POST /admin/escalations/run
  GET /admin/escalations
  Frontend
  Components
  EscalationCard.tsx
  EscalationTable.tsx
  PHASE 4 — ANALYTICS MODULE
  ETA: 3 Hours
  APIs
  GET /analytics/completion
  GET /analytics/qoq
  GET /analytics/managers
  GET /analytics/departments
  Metrics
  Completion Rate
  submittedGoals / totalGoals
  Manager Effectiveness
  completedCheckins / expectedCheckins
  QoQ Trends
  Q1
  Q2
  Q3
  Q4
  Frontend
  Components
  DepartmentHeatmap.tsx
  QoQChart.tsx
  ManagerLeaderboard.tsx
  CompletionChart.tsx
  PHASE 5 — SMART VALIDATION SYSTEM
  ETA: 1.5 Hours
  Rules
  MAX_GOALS = 8
  MIN_WEIGHTAGE = 10
  TOTAL_WEIGHTAGE = 100
  Frontend
  Components
  WeightageTracker.tsx
  GoalLimitIndicator.tsx
  ValidationBanner.tsx
  Behaviors
  Disable Submit
  totalWeightage !== 100
  Color States
  green → valid
  yellow → warning
  red → invalid
  PHASE 6 — GOAL LIFECYCLE VISUALIZATION
  ETA: 1 Hour
  States
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED_LOCKED
  Q1_UPDATED
  Q2_UPDATED
  Q3_UPDATED
  FINALIZED
  Frontend
  Components
  GoalTimeline.tsx
  StatusBadge.tsx
  LifecycleStepper.tsx
  PHASE 7 — ADMIN UNLOCK FLOW
  ETA: 1 Hour
  API
  POST /admin/goals/:id/unlock
  Backend Logic
  goal.isLocked = false
  Requirements
  unlock reason mandatory
  audit log mandatory
  Frontend
  Components
  UnlockGoalModal.tsx
  UnlockReasonForm.tsx
  PHASE 8 — ENTERPRISE SEED DATA
  ETA: 1 Hour
  Seed Structure
  Engineering
  Manager
  Employee A
  Employee B

Product
Manager
Employee C
Seed Data
submitted goals
approved goals
pending approvals
quarterly updates
audit logs
escalations
File
prisma/seed.ts
PHASE 9 — EXPORT REPORTS
ETA: 1 Hour
APIs
GET /reports/goals/export
GET /reports/achievements/export
Format
CSV
Install
npm install json2csv
PHASE 10 — MANAGER REVIEW WORKFLOW
ETA: 2 Hours
Frontend
Components
ApprovalQueue.tsx
ReviewTable.tsx
InlineEditRow.tsx
CommentDrawer.tsx
Table Columns
Employee
Goal
Weightage
Status
Quarter
Actions
Actions
approve
reject
edit
comment
FINAL TESTING CHECKLIST
Employee
create goal
edit draft
submit goals
quarterly update
Manager
review goals
approve/reject
comment
view team metrics
Admin
unlock goals
run escalations
view audit logs
view analytics
FINAL DEPLOYMENT
Environment Variables
DATABASE_URL=
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
Deployment Stack
Frontend/API → Vercel
Database → Supabase
