import prisma from '../prisma/client';

export const runEscalationCheck = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find goals submitted more than 7 days ago and still pending (SUBMITTED or UNDER_REVIEW)
  const pendingGoals = await prisma.goal.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
      updatedAt: { lte: sevenDaysAgo }
    },
    include: {
      employee: {
        include: {
          manager: true
        }
      }
    }
  });

  const escalations = [];

  for (const goal of pendingGoals) {
    // Check if escalation already exists for this user
    const existing = await prisma.escalation.findFirst({
      where: { userId: goal.employeeId, isResolved: false }
    });

    if (!existing) {
      const escalation = await prisma.escalation.create({
        data: {
          userId: goal.employeeId,
          reason: `Pending approval by manager ${goal.employee.manager?.name || 'N/A'} for more than 7 days.`
        }
      });
      
      // Log this in the audit log
      await prisma.auditLog.create({
        data: {
          goalId: goal.id,
          userId: goal.employeeId,
          action: 'ESCALATED',
          after: `Goal escalated to Admin due to delay. Escalation ID: ${escalation.id}`
        }
      });

      escalations.push(escalation);
    }
  }

  return escalations;
};
