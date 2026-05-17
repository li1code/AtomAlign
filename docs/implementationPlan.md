AtomQuest Goal Setting & Tracking Portal, the following implementation plan aligns the technical requirements of the problem statement with the architectural blueprints and Atomberg’s brand identity as a "relentless innovator" that prioritises "mindful design"
.
Phase 1: Foundation, Auth & Branding (Estimated: 4 Hours)
The initial focus is establishing a secure environment with Role-Based Access Control (RBAC)
.
Identity System: Implement JWT-based authentication for three distinct roles: Employee, Manager (L1), and Admin/HR
.
Atomberg Aesthetic: Adopt a UI inspired by the Atomberg website—clean whitespace, "tech-first" innovation, and a professional colour palette (yellow accents, dark greys)
. Avoid "over-animated startup landing page nonsense"
.
Role-Based Redirects: Ensure the system automatically routes users to their respective dashboards: /dashboard/employee, /dashboard/manager, or /dashboard/admin
.
Phase 2: Database Architecture & Validation Engine (Estimated: 4 Hours)
The core logic must be hard-coded into the database schema and validation layers to ensure "audit-ready" reliability
.
Schema Design: Build models using Prisma ORM for Goals, Quarterly Updates, Check-ins, and Audit Logs
.
Validation Rules: The system must strictly enforce three primary constraints during goal creation:
Total weightage must equal exactly 100%
.
Minimum weightage per individual goal is 10%
.
Maximum goals per employee is limited to 8
.
Phase 3: Goal Lifecycle Management (Estimated: 9 Hours)
This phase covers the transition from drafting to locking goals
.
Creation Flow: Employees select a Thrust Area, define a Title/Description, and choose a Unit of Measurement (UoM)
.
Manager Approval Workflow: Managers can edit targets/weightages inline or return the sheet for rework
.
The "Lock" Mechanism: Once approved, goals transition to APPROVED_LOCKED status; further edits are disabled without Admin intervention
.
Shared Goals: Admins can push departmental KPIs to multiple employees. Recipients can adjust weightage, but the Goal Title and Target remain read-only
.
Phase 4: Achievement Tracking & Progress Engine (Estimated: 6 Hours)
Progress is tracked quarterly according to a strict schedule
.
Check-in Windows: Enforce quarterly windows in July, October, January, and March/April
.
Computation Formulas: Implement the Progress Engine based on the UoM type
:
Min (Sales/Revenue): Achievement ÷ Target
.
Max (TAT/Cost): Target ÷ Achievement
.
Zero-based (Safety/Incidents): 100% if Achievement is 0, else 0%
.
Status Capture: Employees must log progress as Not Started, On Track, or Completed
.
Phase 5: Governance, Dashboards & Reporting (Estimated: 7 Hours)
The portal must provide real-time visibility to eliminate manual "blind spots"
.
Dashboards:
Employee: Displays current progress, pending actions, and locked goal cards
.
Manager: A team dashboard showing pending approvals and overdue check-ins
.
Admin: A completion heatmap showing organisational progress and audit trails
.
Audit Trail: Every change made after the goal lock date must log who changed what and when, including "before and after" values
.
Export: Provide functionality to export achievement reports as CSV/Excel
.
Phase 6: Advanced Innovations (Bonus Features)
To differentiate the solution, implement high-value enhancements
:
Escalation Engine: Trigger automated notifications if goals are not submitted within N days of a cycle opening or if check-ins are missed
.
Analytics Module: Visualise Quarter-on-Quarter (QoQ) achievement trends and goal distribution analysis
.
Integrations: If possible, integrate Microsoft Entra ID (Azure AD) for Single Sign-On and automatic org hierarchy syncing
.
