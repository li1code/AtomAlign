import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Protect all routes under admin to strictly require ADMIN role
router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/employees', adminController.getEmployees);
router.get('/goals', adminController.getGoals);
router.post('/shared-goals', adminController.createShared);
router.post('/goals/:id/unlock', adminController.unlockEmployeeGoal);
router.get('/escalations', adminController.getEscalations);
router.post('/escalations/run', adminController.triggerEscalations);
router.get('/reports/goals/export', adminController.exportGoals);
router.get('/reports/achievements/export', adminController.exportAchievements);

export default router;
