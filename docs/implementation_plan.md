ATOMALIGN IMPLEMENTATION PLAN

Mapped directly against SRS requirements

Your structure is now good enough to execute fast.
Do NOT restructure further. Architecture procrastination is just fear wearing a blazer.

IMPLEMENTATION PRIORITY ORDER

1. Auth + RBAC
2. Goal Lifecycle
3. Approval Workflow
4. Quarterly Tracking
5. Dashboards
6. Shared Goals
7. Audit Logs
8. Analytics
9. Escalations
10. Final Polish
    PHASE 1
    AUTH + ROLE SYSTEM
    ETA: 2 Hours
    OBJECTIVE

Establish:

login
JWT auth
protected routes
role-based dashboards
IMPLEMENTATION
Backend
Build
auth.controller.ts
auth.service.ts
auth.routes.ts
jwt.ts
auth.middleware.ts
role.middleware.ts
API
POST /auth/login

Input:

{
"email": "",
"password": ""
}

Output:

{
"token": "",
"user": {}
}
FRONTEND
Build
login/page.tsx
authStore.ts
useAuth.ts
middleware.ts
REQUIRED FEATURES
Role Redirects
EMPLOYEE → /dashboard/employee
MANAGER → /dashboard/manager
ADMIN → /dashboard/admin
DONE CONDITION
✔ login works
✔ JWT stored
✔ protected routes
✔ role-based redirect
✔ session persists
PHASE 2
DATABASE FOUNDATION
ETA: 2 Hours
OBJECTIVE

Complete Prisma schema for all core entities.

IMPLEMENT
Add Models
Required
Goal
GoalUpdate
Checkin
Approval
AuditLog
Department
GoalCycle
SharedGoal
Escalation
CRITICAL RELATIONS
User ↔ Manager
managerId
subordinates[]
Goal ↔ Employee
employeeId
Shared Goal
masterGoalId
linkedGoalIds
DONE CONDITION
✔ prisma db push works
✔ relations functional
✔ seeded test users exist
PHASE 3
GOAL CREATION SYSTEM
ETA: 5 Hours

SRS Core Requirement

OBJECTIVE

Employee creates goals with validation enforcement.

FRONTEND
Build
GoalForm.tsx
WeightageTracker.tsx
GoalTable.tsx
BACKEND
Build
goal.controller.ts
goal.service.ts
goal.routes.ts
validators.ts
REQUIRED FEATURES
Goal Fields
Thrust Area
Title
Description
UoM
Target
Weightage
VALIDATION RULES
Must enforce
Max 8 goals
goals.length <= 8
Min weightage 10%
weightage >= 10
Total exactly 100%
sum(weightages) === 100
UI REQUIREMENTS
Must show live tracker
Total Weightage: 70/100
STATUS FLOW
DRAFT
→ SUBMITTED
DONE CONDITION
✔ employee creates goals
✔ validations work
✔ goals persist
✔ submission works
PHASE 4
MANAGER APPROVAL WORKFLOW
ETA: 4 Hours

SRS Requirement

OBJECTIVE

Manager reviews, edits, approves, rejects.

FRONTEND
Build
ApprovalQueue.tsx
GoalReviewTable.tsx
InlineEditModal.tsx
BACKEND
Build
approveGoal()
rejectGoal()
lockGoal()
REQUIRED FEATURES
Manager Can
✔ edit target
✔ edit weightage
✔ approve
✔ reject
✔ comment
ON APPROVAL
Goal becomes locked
UI REQUIREMENTS
Locked goals show:
✔ lock icon
✔ approved timestamp
✔ read-only state
STATUS FLOW
SUBMITTED
→ UNDER_REVIEW
→ APPROVED_LOCKED
DONE CONDITION
✔ manager queue works
✔ inline edits work
✔ approval locks goal
✔ rejection returns to employee
PHASE 5
SHARED GOALS SYSTEM
ETA: 3 Hours

SRS Requirement

OBJECTIVE

Admin/manager distributes KPI goals.

ARCHITECTURE
Master Goal Model
Master Goal
↓
Linked Employee Goals
RULES
Editable by employee
weightage only
Read-only
title
target
description
SYNC LOGIC

Primary owner update propagates:

achievement
status
progress
DONE CONDITION
✔ shared goal creation works
✔ propagation works
✔ linked updates sync
PHASE 6
QUARTERLY TRACKING
ETA: 4 Hours

SRS Requirement

OBJECTIVE

Track actual achievements and progress.

FRONTEND
Build
QuarterlyUpdateForm.tsx
ProgressStatusBadge.tsx
CheckinTimeline.tsx
BACKEND
Build
createQuarterlyUpdate()
calculateProgress()
REQUIRED FIELDS
planned target
actual achievement
status
quarter
STATUS OPTIONS
Not Started
On Track
Completed
PROGRESS ENGINE
Build in:
progressEngine.ts
FORMULAS
Min
achievement / target
Max
target / achievement
Zero
achievement === 0 ? 100 : 0
DONE CONDITION
✔ quarterly updates save
✔ calculations accurate
✔ statuses visible
PHASE 7
CHECK-IN SYSTEM
ETA: 2 Hours

SRS Requirement

OBJECTIVE

Manager logs structured check-ins.

FRONTEND
Build
CheckinModal.tsx
FeedbackPanel.tsx
BACKEND
Build
createCheckin()
getEmployeeCheckins()
REQUIRED FEATURES
✔ manager comment
✔ quarter tracking
✔ timestamps
✔ employee visibility
DONE CONDITION
✔ comments persist
✔ history visible
✔ linked to quarter
PHASE 8
DASHBOARDS
ETA: 5 Hours
EMPLOYEE DASHBOARD
Components
Goal Cards
Progress %
Status Tracker
Quarter Timeline
Pending Actions
MANAGER DASHBOARD
Components
Pending Approvals
Team Progress
Overdue Check-ins
Risk Employees
ADMIN DASHBOARD
Components
Completion Heatmap
Escalations
Audit Logs
Department Progress
IMPORTANT

Use:

tables + charts + badges

NOT:

over-animated startup landing page nonsense
PHASE 9
AUDIT LOG SYSTEM
ETA: 2 Hours

SRS Requirement

OBJECTIVE

Track all post-lock modifications.

LOG EVENTS
goal edited
goal unlocked
target changed
weightage changed
approval action
STRUCTURE
who
what
when
before
after
DONE CONDITION
✔ logs generated automatically
✔ admin can view logs
PHASE 10
ANALYTICS MODULE
ETA: 3 Hours

SRS Bonus Requirement

BUILD
Charts
QoQ achievement trends
completion heatmaps
goal distribution
manager effectiveness
RECOMMENDED

Use:

Recharts
KEEP SIMPLE

1 chart = 1 insight

Do not build Bloomberg Terminal for HR.

PHASE 11
ESCALATION ENGINE
ETA: 2 Hours

SRS Bonus Requirement

OBJECTIVE

Detect overdue actions automatically.

CONDITIONS
goal not submitted
approval pending
check-in incomplete
IMPLEMENTATION

Simple cron job:

node-cron
OUTPUT
notification
dashboard warning
admin escalation
PHASE 12
FINAL POLISH
ETA: Remaining Time
PRIORITY

1. Bug Elimination

Test:

auth
permissions
state transitions
validation
sync logic 2. Demo Data

Seed:

employees
managers
departments
goals
checkins 3. Demo Narrative

Prepare:

employee flow
manager flow
admin visibility
FINAL SUCCESS CHECKLIST
MUST WORK
✔ login
✔ role-based dashboards
✔ goal creation
✔ validation rules
✔ approval flow
✔ goal locking
✔ quarterly updates
✔ progress calculations
✔ check-ins
✔ dashboards
✔ audit logs
✔ shared goals
BONUS IF TIME EXISTS
✔ escalations
✔ analytics
✔ notifications
✔ CSV export
