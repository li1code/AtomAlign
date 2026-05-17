import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { runEscalationCheck } from '../services/escalation.service';
import * as auditService from '../services/audit.service';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
    
    // Simplistic completion rate based on submitted goals vs employees
    const submittedGoalsCount = await prisma.goal.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED_LOCKED', 'FINALIZED'] } }
    });
    // This is just a proxy metric
    const submissionRate = totalEmployees > 0 ? Math.min(Math.round((submittedGoalsCount / (totalEmployees * 5)) * 100), 100) : 0;
    
    const pendingApprovals = await prisma.goal.count({
      where: { status: 'SUBMITTED' }
    });

    const activeEscalations = await prisma.escalation.count({
      where: { isResolved: false }
    });

    res.json({
      totalEmployees,
      submissionRate,
      pendingApprovals,
      activeEscalations
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerEscalations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const escalations = await runEscalationCheck();
    res.json({
      message: 'Escalation check run successfully',
      escalatedCount: escalations.length,
      escalations
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await auditService.getAuditLogs();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
