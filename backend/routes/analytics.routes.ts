import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN', 'MANAGER']));

router.get('/stats', analyticsController.getDashboardStats);
router.post('/escalate/trigger', requireRole(['ADMIN']), analyticsController.triggerEscalations);
router.get('/audit-logs', requireRole(['ADMIN']), analyticsController.getAuditLogs);

export default router;
