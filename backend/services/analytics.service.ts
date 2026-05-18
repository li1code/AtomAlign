import prisma from '../prisma/client';
import { Quarter } from '@prisma/client';
import { calculateProgress } from '../utils/progressEngine';

export const getDepartmentProgress = async () => {
  const departments = await prisma.department.findMany({
    include: {
      users: {
        include: {
          goals: {
            include: { updates: true }
          }
        }
      }
    }
  });

  return departments.map(dept => {
    let totalGoals = 0;
    let totalProgress = 0;

    dept.users.forEach(user => {
      user.goals.forEach(goal => {
        totalGoals++;
        if (goal.updates.length > 0) {
          // Average the progress across all updates
          const goalProgress = goal.updates.reduce((sum, u) => {
            return sum + calculateProgress(goal.uomType, u.plannedTarget, u.actualAchievement);
          }, 0) / goal.updates.length;
          totalProgress += goalProgress;
        }
      });
    });

    const averageProgress = totalGoals > 0 ? Math.round(totalProgress / totalGoals) : 0;

    return {
      departmentId: dept.id,
      departmentName: dept.name,
      employeeCount: dept.users.length,
      averageProgress
    };
  });
};

export const getQoQTrends = async () => {
  const updates = await prisma.goalUpdate.findMany({
    include: { goal: true }
  });

  const quarterStats: Record<Quarter, { sum: number; count: number }> = {
    Q1: { sum: 0, count: 0 },
    Q2: { sum: 0, count: 0 },
    Q3: { sum: 0, count: 0 },
    Q4: { sum: 0, count: 0 },
    ANNUAL: { sum: 0, count: 0 }
  };

  updates.forEach(u => {
    const progress = calculateProgress(u.goal.uomType, u.plannedTarget, u.actualAchievement);
    if (quarterStats[u.quarter]) {
      quarterStats[u.quarter].sum += progress;
      quarterStats[u.quarter].count++;
    }
  });

  return Object.keys(quarterStats).map(q => {
    const stat = quarterStats[q as Quarter];
    return {
      quarter: q,
      averageProgress: stat.count > 0 ? Math.round(stat.sum / stat.count) : 0,
      updateCount: stat.count
    };
  }).filter(q => q.quarter !== 'ANNUAL'); // Keep standard Q1-Q4 check-ins
};

export const getGoalDistribution = async () => {
  // Goals by thrust area
  const thrustAreas = await prisma.goal.groupBy({
    by: ['thrustArea'],
    _count: { id: true }
  });

  // Goals by UOMType
  const uomTypes = await prisma.goal.groupBy({
    by: ['uomType'],
    _count: { id: true }
  });

  // Goals by Status
  const statuses = await prisma.goal.groupBy({
    by: ['status'],
    _count: { id: true }
  });

  return {
    byThrustArea: thrustAreas.map(t => ({ name: t.thrustArea, count: t._count.id })),
    byUom: uomTypes.map(u => ({ name: u.uomType, count: u._count.id })),
    byStatus: statuses.map(s => ({ name: s.status, count: s._count.id }))
  };
};

export const getManagerEffectiveness = async () => {
  const managers = await prisma.user.findMany({
    where: { role: 'MANAGER' },
    include: {
      subordinates: {
        include: {
          goals: {
            where: { status: 'APPROVED_LOCKED' },
            include: { checkins: true }
          }
        }
      }
    }
  });

  return managers.map(m => {
    let expectedCheckins = 0;
    let completedCheckins = 0;

    m.subordinates.forEach(sub => {
      // Each locked goal requires 4 checkins (one per quarter)
      expectedCheckins += sub.goals.length * 4;
      sub.goals.forEach(goal => {
        completedCheckins += goal.checkins.length;
      });
    });

    const completionRate = expectedCheckins > 0 ? Math.round((completedCheckins / expectedCheckins) * 100) : 0;

    return {
      managerName: m.name,
      email: m.email,
      subordinateCount: m.subordinates.length,
      completionRate
    };
  });
};
