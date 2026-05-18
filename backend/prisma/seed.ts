import { PrismaClient, Role, GoalStatus, UOMType, Quarter, UpdateStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing database tables...');
  
  // Truncate existing data to start clean
  await prisma.escalation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.goalUpdate.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.sharedGoal.deleteMany();
  await prisma.goalCycle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('Seeding enterprise database structure...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // 1. Create Departments
  const engDept = await prisma.department.create({ data: { name: 'Engineering' } });
  const prodDept = await prisma.department.create({ data: { name: 'Product' } });
  const hrDept = await prisma.department.create({ data: { name: 'HR' } });

  // 2. Create Users (Admins, Managers, Employees)
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@atomberg.com',
      password: hashedPassword,
      role: 'ADMIN',
      departmentId: hrDept.id
    }
  });

  const engManager = await prisma.user.create({
    data: {
      name: 'Engineering Manager',
      email: 'manager@atomberg.com',
      password: hashedPassword,
      role: 'MANAGER',
      departmentId: engDept.id
    }
  });

  const prodManager = await prisma.user.create({
    data: {
      name: 'Product Manager',
      email: 'prod_manager@atomberg.com',
      password: hashedPassword,
      role: 'MANAGER',
      departmentId: prodDept.id
    }
  });

  // Employee A: Engineering (Draft State)
  const employeeA = await prisma.user.create({
    data: {
      name: 'Employee A (Engineer)',
      email: 'employee@atomberg.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: engDept.id,
      managerId: engManager.id
    }
  });

  // Employee B: Engineering (Submitted State)
  const employeeB = await prisma.user.create({
    data: {
      name: 'Employee B (QA Specialist)',
      email: 'qa_employee@atomberg.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: engDept.id,
      managerId: engManager.id
    }
  });

  // Employee C: Product (Approved & Locked State)
  const employeeC = await prisma.user.create({
    data: {
      name: 'Employee C (Designer)',
      email: 'designer_employee@atomberg.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: prodDept.id,
      managerId: prodManager.id
    }
  });

  console.log('Seeding active Goal Cycle...');
  
  // 3. Create Goal Cycle
  const cycle = await prisma.goalCycle.create({
    data: {
      name: 'FY2026 Cycle',
      startDate: new Date('2026-05-01T00:00:00Z'),
      endDate: new Date('2027-04-30T23:59:59Z'),
      isActive: true
    }
  });

  console.log('Seeding Employee Goals...');

  // 4. Create Draft Goals for Employee A
  await prisma.goal.createMany({
    data: [
      {
        title: 'Core Engine Optimization',
        description: 'Optimize backend Express query routing to improve latency by 20%.',
        thrustArea: 'Technology Innovation',
        target: 20,
        weightage: 30,
        status: 'DRAFT',
        uomType: 'PERCENT_MIN',
        employeeId: employeeA.id,
        cycleId: cycle.id
      },
      {
        title: 'Redundant Code Cleanup',
        description: 'Reduce codebase complexity by removing unused dependencies and legacy scripts.',
        thrustArea: 'Operational Excellence',
        target: 100,
        weightage: 30,
        status: 'DRAFT',
        uomType: 'PERCENT_MIN',
        employeeId: employeeA.id,
        cycleId: cycle.id
      },
      {
        title: 'Prisma Cache Service',
        description: 'Design a caching layer on top of Prisma middleware to lower database workloads.',
        thrustArea: 'Technology Innovation',
        target: 1,
        weightage: 40,
        status: 'DRAFT',
        uomType: 'NUMERIC_MIN',
        employeeId: employeeA.id,
        cycleId: cycle.id
      }
    ]
  });

  // 5. Create Submitted Goals for Employee B
  const bGoals = await Promise.all([
    prisma.goal.create({
      data: {
        title: 'Automated E2E Suite',
        description: 'Implement end-to-end regression test scripts for portal onboarding.',
        thrustArea: 'Quality Engineering',
        target: 85,
        weightage: 40,
        status: 'SUBMITTED',
        uomType: 'PERCENT_MIN',
        employeeId: employeeB.id,
        cycleId: cycle.id
      }
    }),
    prisma.goal.create({
      data: {
        title: 'Load Testing Scripting',
        description: 'Conduct stress tests to identify throughput limits of concurrent check-ins.',
        thrustArea: 'Quality Engineering',
        target: 500,
        weightage: 30,
        status: 'SUBMITTED',
        uomType: 'NUMERIC_MIN',
        employeeId: employeeB.id,
        cycleId: cycle.id
      }
    }),
    prisma.goal.create({
      data: {
        title: 'Bug Escape Rate Reduction',
        description: 'Minimize production bug escape rate down below 5% through robust validation.',
        thrustArea: 'Operational Excellence',
        target: 5,
        weightage: 30,
        status: 'SUBMITTED',
        uomType: 'PERCENT_MAX',
        employeeId: employeeB.id,
        cycleId: cycle.id
      }
    })
  ]);

  // 6. Create Approved/Locked Goals for Employee C (with updates and checkins)
  const cGoal1 = await prisma.goal.create({
    data: {
      title: 'High-Fidelity Dashboard Designs',
      description: 'Deliver wireframes and fully aligned design components for the user dashboard.',
      thrustArea: 'Design Systems',
      target: 10,
      weightage: 40,
      status: 'APPROVED_LOCKED',
      isLocked: true,
      uomType: 'NUMERIC_MIN',
      employeeId: employeeC.id,
      cycleId: cycle.id
    }
  });

  const cGoal2 = await prisma.goal.create({
    data: {
      title: 'Component Usability Surveys',
      description: 'Conduct user tests and gather feedback to improve interface intuitiveness.',
      thrustArea: 'User Research',
      target: 90,
      weightage: 30,
      status: 'APPROVED_LOCKED',
      isLocked: true,
      uomType: 'PERCENT_MIN',
      employeeId: employeeC.id,
      cycleId: cycle.id
    }
  });

  const cGoal3 = await prisma.goal.create({
    data: {
      title: 'Design Library Alignment',
      description: 'Align design system guidelines with active brand specifications.',
      thrustArea: 'Design Systems',
      target: 100,
      weightage: 30,
      status: 'APPROVED_LOCKED',
      isLocked: true,
      uomType: 'PERCENT_MIN',
      employeeId: employeeC.id,
      cycleId: cycle.id
    }
  });

  // 7. Seed Q1 Progress updates and manager check-ins for Employee C
  await prisma.goalUpdate.createMany({
    data: [
      {
        goalId: cGoal1.id,
        quarter: 'Q1',
        plannedTarget: 10,
        actualAchievement: 8,
        status: 'ON_TRACK'
      },
      {
        goalId: cGoal2.id,
        quarter: 'Q1',
        plannedTarget: 90,
        actualAchievement: 90,
        status: 'COMPLETED'
      }
    ]
  });

  await prisma.checkin.createMany({
    data: [
      {
        goalId: cGoal1.id,
        managerId: prodManager.id,
        quarter: 'Q1',
        managerComment: 'Superb initial layouts! A few refinements are remaining, but the UX direction is incredibly strong.'
      },
      {
        goalId: cGoal2.id,
        managerId: prodManager.id,
        quarter: 'Q1',
        managerComment: '100% target met for research survey rounds. Feedback has been converted to items on the dev roadmap.'
      }
    ]
  });

  console.log('Seeding Audit Trails and Escalations...');

  // 8. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        goalId: cGoal1.id,
        userId: prodManager.id,
        action: 'GOAL_LOCKED',
        before: 'Status: SUBMITTED, Locked: false',
        after: 'Status: APPROVED_LOCKED, Locked: true'
      },
      {
        goalId: cGoal2.id,
        userId: prodManager.id,
        action: 'GOAL_LOCKED',
        before: 'Status: SUBMITTED, Locked: false',
        after: 'Status: APPROVED_LOCKED, Locked: true'
      },
      {
        goalId: cGoal3.id,
        userId: prodManager.id,
        action: 'GOAL_LOCKED',
        before: 'Status: SUBMITTED, Locked: false',
        after: 'Status: APPROVED_LOCKED, Locked: true'
      }
    ]
  });

  // 9. Seed active mock Escalation
  await prisma.escalation.create({
    data: {
      userId: employeeB.id,
      reason: 'QA Specialist Employee B has pending goal sheet submissions waiting L1 review for more than 7 days.',
      isResolved: false
    }
  });

  console.log('Enterprise Database Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
