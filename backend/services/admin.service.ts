import prisma from '../prisma/client';
import { UOMType, GoalStatus, Quarter } from '@prisma/client';
import { runEscalationCheck } from './escalation.service';
import { calculateProgress } from '../utils/progressEngine';

export const getEmployees = async () => {
  return await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    select: {
      id: true,
      name: true,
      email: true,
      department: { select: { name: true } }
    },
    orderBy: { name: 'asc' }
  });
};

export const getAllGoals = async () => {
  return await prisma.goal.findMany({
    include: {
      employee: {
        select: {
          name: true,
          email: true,
          department: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const createSharedGoal = async (data: {
  title: string;
  description: string;
  thrustArea: string;
  target: number;
  uomType: string;
  employeeIds: string[];
  primaryEmployeeId?: string;
}) => {
  if (!data.employeeIds || data.employeeIds.length === 0) {
    throw new Error('At least one employee must be selected');
  }

  // Create parent SharedGoal record
  const sharedGoal = await prisma.sharedGoal.create({
    data: {
      title: data.title,
      description: data.description,
      thrustArea: data.thrustArea,
      target: data.target,
      uomType: data.uomType as UOMType,
    }
  });

  // If no primary owner is selected, default to the first employee
  const primaryId = data.primaryEmployeeId || data.employeeIds[0];

  // Distribute individual Goal records to all designated employees
  const createdGoals = await prisma.$transaction(
    data.employeeIds.map(empId => prisma.goal.create({
      data: {
        title: data.title,
        description: data.description,
        thrustArea: data.thrustArea,
        target: data.target,
        weightage: 0, // Employees must assign a weightage themselves to complete their 100% sheet
        status: 'DRAFT',
        uomType: data.uomType as UOMType,
        isShared: true,
        isPrimary: empId === primaryId,
        sharedGoalId: sharedGoal.id,
        employeeId: empId
      }
    }))
  );

  return { sharedGoal, goals: createdGoals };
};

export const unlockGoal = async (goalId: string, userId: string, reason: string) => {
  if (!reason || reason.trim() === '') {
    throw new Error('An unlock reason is mandatory');
  }

  const goal = await prisma.goal.findUnique({
    where: { id: goalId }
  });

  if (!goal) {
    throw new Error('Goal not found');
  }

  const updatedGoal = await prisma.goal.update({
    where: { id: goalId },
    data: {
      isLocked: false,
      status: 'DRAFT'
    }
  });

  // Track the unlock action in the audit trail
  await prisma.auditLog.create({
    data: {
      goalId,
      userId,
      action: 'GOAL_UNLOCKED',
      before: 'Locked: true, Status: APPROVED_LOCKED',
      after: `Locked: false, Status: DRAFT, Reason: ${reason}`
    }
  });

  return updatedGoal;
};

export const getEscalations = async () => {
  return await prisma.escalation.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          department: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const runEscalations = async () => {
  return await runEscalationCheck();
};

// Helper for generating CSV
const generateCSV = (headers: string[], rows: string[][]): string => {
  const escapeVal = (val: string) => {
    const clean = val.replace(/"/g, '""');
    return clean.includes(',') || clean.includes('"') || clean.includes('\n') ? `"${clean}"` : clean;
  };
  
  const headerLine = headers.join(',');
  const rowLines = rows.map(r => r.map(escapeVal).join(','));
  return [headerLine, ...rowLines].join('\n');
};

export const exportGoalsReport = async (): Promise<string> => {
  const goals = await prisma.goal.findMany({
    include: {
      employee: {
        include: { department: true }
      }
    },
    orderBy: { employee: { name: 'asc' } }
  });

  const headers = ['Employee Name', 'Email', 'Department', 'Goal Title', 'Thrust Area', 'Target', 'Weightage %', 'Status', 'Locked', 'Shared'];
  const rows = goals.map(g => [
    g.employee.name,
    g.employee.email,
    g.employee.department?.name || 'N/A',
    g.title,
    g.thrustArea,
    g.target.toString(),
    g.weightage.toString(),
    g.status,
    g.isLocked ? 'Yes' : 'No',
    g.isShared ? 'Yes' : 'No'
  ]);

  return generateCSV(headers, rows);
};

export const exportAchievementsReport = async (): Promise<string> => {
  const updates = await prisma.goalUpdate.findMany({
    include: {
      goal: {
        include: {
          employee: {
            include: { department: true }
          }
        }
      }
    },
    orderBy: [
      { goal: { employee: { name: 'asc' } } },
      { quarter: 'asc' }
    ]
  });

  const headers = [
    'Employee Name',
    'Department',
    'Goal Title',
    'Quarter',
    'Planned Target',
    'Actual Achievement',
    'Progress %',
    'Status'
  ];

  const rows = updates.map(u => {
    const progressVal = calculateProgress(u.goal.uomType, u.plannedTarget, u.actualAchievement);
    return [
      u.goal.employee.name,
      u.goal.employee.department?.name || 'N/A',
      u.goal.title,
      u.quarter,
      u.plannedTarget.toString(),
      u.actualAchievement.toString(),
      `${Math.round(progressVal)}%`,
      u.status
    ];
  });

  return generateCSV(headers, rows);
};
