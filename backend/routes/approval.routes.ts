import { Router } from 'express';
import * as approvalController from '../controllers/approval.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['MANAGER', 'ADMIN']));

router.get('/pending', approvalController.getPending);
router.get('/team-goals', approvalController.getTeam);
router.post('/:id/approve', approvalController.approveGoal);
router.post('/:id/reject', approvalController.rejectGoal);

export default router;
