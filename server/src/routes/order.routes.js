import express from 'express';
import { createOrder, getOrderById, getMyOrders } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Optional auth middleware for createOrder: attach req.user if Bearer token present
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      await protect(req, res, next);
      return;
    } catch (e) {
      // Continue as guest
    }
  }
  next();
};

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', getOrderById);

export default router;

