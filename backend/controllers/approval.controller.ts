import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as approvalService from '../services/approval.service';

export const getPending = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await approvalService.getPendingApprovals(req.user!.id);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await approvalService.getTeamGoals(req.user!.id);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const result = await approvalService.updateGoalStatus(req.user!.id, id as string, 'APPROVED_LOCKED', comment);
    res.json({ message: 'Goal approved successfully', goal: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const result = await approvalService.updateGoalStatus(req.user!.id, id as string, 'DRAFT', comment); // Rejecting sends it back to DRAFT
    res.json({ message: 'Goal rejected successfully', goal: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
