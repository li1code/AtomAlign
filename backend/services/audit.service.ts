import prisma from '../prisma/client';

export const logAudit = async (goalId: string, userId: string, action: string, before?: string, after?: string) => {
  return await prisma.auditLog.create({
    data: {
      goalId,
      userId,
      action,
      before,
      after
    }
  });
};

export const getAuditLogs = async () => {
  return await prisma.auditLog.findMany({
    include: {
      user: { select: { name: true, role: true } },
      goal: { select: { title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
};
