import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../prisma/client';
import { runEscalationCheck } from '../services/escalation.service';
import * as auditService from '../services/audit.service';
import * as analyticsService from '../services/analytics.service';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalEmployees = await prisma.user.count({ where: { role: 'EMPLOYEE' } });
    
    // Completion rate based on submitted or locked goals vs employees
    const submittedGoalsCount = await prisma.goal.count({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED_LOCKED', 'FINALIZED'] } }
    });
    
    const submissionRate = totalEmployees > 0 ? Math.min(Math.round((submittedGoalsCount / (totalEmployees * 4)) * 100), 100) : 0;
    
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

export const getDepartmentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await analyticsService.getDepartmentProgress();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getQoQStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await analyticsService.getQoQTrends();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDistributionStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await analyticsService.getGoalDistribution();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getManagerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await analyticsService.getManagerEffectiveness();
    res.json(result);
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
