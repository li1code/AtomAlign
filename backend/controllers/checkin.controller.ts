import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as checkinService from '../services/checkin.service';

export const updateProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // goalId
    const { quarter, actualAchievement, status } = req.body;
    
    const result = await checkinService.createQuarterlyUpdate(req.user!.id, id, { quarter, actualAchievement, status });
    res.json({ message: 'Progress updated successfully', ...result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const managerCheckin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // goalId
    const { quarter, comment } = req.body;
    
    const result = await checkinService.createManagerCheckin(req.user!.id, id, quarter, comment);
    res.json({ message: 'Check-in saved successfully', checkin: result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
