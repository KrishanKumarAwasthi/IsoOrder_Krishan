import express from 'express';
import {
  getAllMenuItemsAdmin,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleOutletAvailability,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllOutletsAdmin,
  updateOutletAdmin,
} from '../controllers/admin.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../shared/constants.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Menu item routes (Admin only)
router.get('/menu-items', requireRole(ROLES.ADMIN, ROLES.KITCHEN), getAllMenuItemsAdmin);
router.post('/menu-items', requireRole(ROLES.ADMIN), createMenuItem);
router.put('/menu-items/:id', requireRole(ROLES.ADMIN), updateMenuItem);
router.delete('/menu-items/:id', requireRole(ROLES.ADMIN), deleteMenuItem);

// Outlet availability toggle (Admin and Kitchen staff can toggle stock)
router.put(
  '/menu-items/:id/availability',
  requireRole(ROLES.ADMIN, ROLES.KITCHEN),
  toggleOutletAvailability
);

// Category routes (Admin only)
router.get('/categories', requireRole(ROLES.ADMIN), getAllCategoriesAdmin);
router.post('/categories', requireRole(ROLES.ADMIN), createCategory);
router.put('/categories/:id', requireRole(ROLES.ADMIN), updateCategory);
router.delete('/categories/:id', requireRole(ROLES.ADMIN), deleteCategory);

// Outlet management routes (Admin only)
router.get('/outlets', requireRole(ROLES.ADMIN), getAllOutletsAdmin);
router.put('/outlets/:id', requireRole(ROLES.ADMIN), updateOutletAdmin);

export default router;

