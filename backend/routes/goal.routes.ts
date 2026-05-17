import { Router } from 'express';
import * as goalController from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/draft', requireRole(['EMPLOYEE']), goalController.draftGoals);
router.post('/submit', requireRole(['EMPLOYEE']), goalController.submitGoals);
router.get('/my', requireRole(['EMPLOYEE']), goalController.getMyGoals);

// Shared/management routes
router.put('/:id', requireRole(['MANAGER', 'ADMIN']), goalController.updateGoal);

export default router;
