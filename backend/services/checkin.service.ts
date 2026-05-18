import prisma from '../prisma/client';
import { calculateProgress } from '../utils/progressEngine';
import { Quarter, UpdateStatus } from '@prisma/client';

export const createQuarterlyUpdate = async (employeeId: string, goalId: string, data: { quarter: string, actualAchievement: number, status: string }) => {
  // Ensure the goal belongs to the employee and is locked
  const goal = await prisma.goal.findUnique({
    where: { id: goalId }
  });

  if (!goal) throw new Error('Goal not found');
  if (goal.employeeId !== employeeId) throw new Error('Unauthorized');
  if (!goal.isLocked) throw new Error('Cannot track progress on unlocked goals');

  const progress = calculateProgress(goal.uomType, goal.target, data.actualAchievement);

  const update = await prisma.goalUpdate.upsert({
    where: {
      goalId_quarter: {
        goalId: goal.id,
        quarter: data.quarter as Quarter
      }
    },
    update: {
      actualAchievement: data.actualAchievement,
      status: data.status as UpdateStatus,
      plannedTarget: goal.target
    },
    create: {
      goalId: goal.id,
      quarter: data.quarter as Quarter,
      plannedTarget: goal.target,
      actualAchievement: data.actualAchievement,
      status: data.status as UpdateStatus
    }
  });

  // If the goal is a primary shared goal, propagate the update to all linked goals
  if (goal.isShared && goal.isPrimary && goal.sharedGoalId) {
    const linkedGoals = await prisma.goal.findMany({
      where: {
        sharedGoalId: goal.sharedGoalId,
        id: { not: goal.id }
      }
    });

    for (const lg of linkedGoals) {
      await prisma.goalUpdate.upsert({
        where: {
          goalId_quarter: {
            goalId: lg.id,
            quarter: data.quarter as Quarter
          }
        },
        update: {
          actualAchievement: data.actualAchievement,
          status: data.status as UpdateStatus,
          plannedTarget: lg.target
        },
        create: {
          goalId: lg.id,
          quarter: data.quarter as Quarter,
          plannedTarget: lg.target,
          actualAchievement: data.actualAchievement,
          status: data.status as UpdateStatus
        }
      });
    }
  }

  return { update, progress };
};

export const createManagerCheckin = async (managerId: string, goalId: string, quarter: string, comment: string) => {
  // Ensure manager is authorized for this goal
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: { employee: true }
  });

  if (!goal || goal.employee.managerId !== managerId) {
    throw new Error('Unauthorized to check in for this goal');
  }

  const checkin = await prisma.checkin.upsert({
    where: {
      goalId_quarter: {
        goalId: goal.id,
        quarter: quarter as Quarter
      }
    },
    update: {
      managerComment: comment
    },
    create: {
      goalId: goal.id,
      managerId,
      quarter: quarter as Quarter,
      managerComment: comment
    }
  });

  return checkin;
};
