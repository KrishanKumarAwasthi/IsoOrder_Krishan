import express from 'express';
import { getMenuByOutlet, getCategories, getMenuItemById } from '../controllers/menu.controller.js';

const router = express.Router();

router.get('/outlet/:outletId', getMenuByOutlet);
router.get('/categories', getCategories);
router.get('/item/:id', getMenuItemById);

export default router;

