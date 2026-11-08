import express from 'express';
import {
  createPartyOrder,
  getAllPartyOrders,
  updatePartyOrderStatus,
} from '../controllers/partyOrder.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

// Public: Submit a party order request
router.post('/', createPartyOrder);

// Admin & Kitchen / Catering Manager routes
router.get('/', protect, requireRole(ROLES.ADMIN, ROLES.KITCHEN), getAllPartyOrders);
router.put('/:id/confirm', protect, requireRole(ROLES.ADMIN, ROLES.KITCHEN), updatePartyOrderStatus);

export default router;

