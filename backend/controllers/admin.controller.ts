import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as adminService from '../services/admin.service';

export const getEmployees = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const employees = await adminService.getEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await adminService.getAllGoals();
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createShared = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.createSharedGoal(req.body);
    res.status(201).json({ message: 'Shared goal distributed successfully', ...result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const unlockEmployeeGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await adminService.unlockGoal(id as string, req.user!.id, reason);
    res.json({ message: 'Goal sheet unlocked successfully', goal: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getEscalations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const escalations = await adminService.getEscalations();
    res.json(escalations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerEscalations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const escalations = await adminService.runEscalations();
    res.json({
      message: 'Escalation sweep completed successfully',
      escalatedCount: escalations.length,
      escalations
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const csvContent = await adminService.exportGoalsReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=goals_report.csv');
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const exportAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const csvContent = await adminService.exportAchievementsReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=achievements_report.csv');
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
