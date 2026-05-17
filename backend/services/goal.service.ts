import prisma from '../prisma/client';
import { validateGoalSubmission } from '../utils/validators';
import { UOMType, GoalStatus } from '@prisma/client';

export const createDraftGoals = async (employeeId: string, goalsData: any[]) => {
  // We can create/save drafts without full 100% validation, but we enforce basic structure
  
  // Clear existing DRAFT goals first
  await prisma.goal.deleteMany({
    where: { employeeId, status: 'DRAFT' }
  });

  const createdGoals = await prisma.$transaction(
    goalsData.map(g => prisma.goal.create({
      data: {
        title: g.title,
        description: g.description,
        thrustArea: g.thrustArea,
        target: g.target,
        weightage: g.weightage,
        uomType: g.uomType as UOMType,
        status: 'DRAFT',
        employeeId
      }
    }))
  );

  return createdGoals;
};

export const submitGoals = async (employeeId: string, goalsData: any[]) => {
  // Validate strict BRD rules before submission
  validateGoalSubmission(goalsData);

  // Clear existing SUBMITTED or DRAFT goals (assuming replacement)
  await prisma.goal.deleteMany({
    where: { 
      employeeId, 
      status: { in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'] } 
    }
  });

  const createdGoals = await prisma.$transaction(
    goalsData.map(g => prisma.goal.create({
      data: {
        title: g.title,
        description: g.description,
        thrustArea: g.thrustArea,
        target: g.target,
        weightage: g.weightage,
        uomType: g.uomType as UOMType,
        status: 'SUBMITTED',
        employeeId
      }
    }))
  );

  return createdGoals;
};

export const getMyGoals = async (employeeId: string) => {
  return await prisma.goal.findMany({
    where: { employeeId },
    orderBy: { createdAt: 'desc' }
  });
};

export const updateGoal = async (userId: string, goalId: string, data: any) => {
  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) throw new Error('Goal not found');

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      title: data.title,
      description: data.description,
      target: data.target,
      weightage: data.weightage,
      status: data.status
    }
  });

  await prisma.auditLog.create({
    data: {
      goalId,
      userId,
      action: 'GOAL_UPDATED',
      before: `Target: ${goal.target}, Weightage: ${goal.weightage}`,
      after: `Target: ${updated.target}, Weightage: ${updated.weightage}`
    }
  });

  return updated;
};
