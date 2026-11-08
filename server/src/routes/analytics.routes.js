import express from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

router.get('/dashboard', getDashboardAnalytics);

export default router;

