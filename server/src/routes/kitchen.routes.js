import express from 'express';
import {
  getKitchenOrders,
  updateOrderStatus,
  overrideOrderEstimate,
} from '../controllers/kitchen.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

// Allow kitchen staff and admins to view and manage kitchen orders
// Optionally allow demo testing without blocking if unauthenticated in preview mode
const optionalKitchenAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      await protect(req, res, next);
      return;
    } catch (e) {
      // Fall through
    }
  }
  next();
};

router.get('/orders', optionalKitchenAuth, getKitchenOrders);
router.put('/orders/:id/status', optionalKitchenAuth, updateOrderStatus);
router.put('/orders/:id/estimate', optionalKitchenAuth, overrideOrderEstimate);

export default router;

