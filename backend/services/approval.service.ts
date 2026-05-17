import prisma from '../prisma/client';

export const getPendingApprovals = async (managerId: string) => {
  return await prisma.goal.findMany({
    where: {
      employee: {
        managerId: managerId
      },
      status: 'SUBMITTED'
    },
    include: {
      employee: {
        select: { name: true, department: true }
      }
    }
  });
};

export const updateGoalStatus = async (managerId: string, goalId: string, status: 'APPROVED_LOCKED' | 'UNDER_REVIEW' | 'DRAFT', comment?: string) => {
  // First verify the goal belongs to a subordinate
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      employee: { managerId }
    }
  });

  if (!goal) {
    throw new Error('Goal not found or you are not authorized to approve it.');
  }

  const updated = await prisma.goal.update({
    where: { id: goalId },
    data: {
      status,
      isLocked: status === 'APPROVED_LOCKED'
    }
  });

  if (comment) {
    await prisma.approval.create({
      data: {
        goalId,
        managerId,
        status: status === 'APPROVED_LOCKED' ? 'APPROVED' : 'REJECTED',
        comment
      }
    });
  }

  return updated;
};
