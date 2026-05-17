import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as goalService from '../services/goal.service';

export const draftGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = req.body.goals;
    const result = await goalService.createDraftGoals(req.user!.id, goals);
    res.json({ message: 'Drafts saved successfully', goals: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const submitGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = req.body.goals;
    const result = await goalService.submitGoals(req.user!.id, goals);
    res.json({ message: 'Goals submitted successfully', goals: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMyGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const goals = await goalService.getMyGoals(req.user!.id);
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await goalService.updateGoal(req.user!.id, id, req.body);
    res.json({ message: 'Goal updated successfully', goal: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
