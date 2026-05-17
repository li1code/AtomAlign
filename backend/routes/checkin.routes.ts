import { Router } from 'express';
import * as checkinController from '../controllers/checkin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Employee updates progress
router.post('/goals/:id/progress', requireRole(['EMPLOYEE']), checkinController.updateProgress);

// Manager adds check-in comment
router.post('/goals/:id/checkin', requireRole(['MANAGER', 'ADMIN']), checkinController.managerCheckin);

export default router;
