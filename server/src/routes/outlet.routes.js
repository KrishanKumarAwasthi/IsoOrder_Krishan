import express from 'express';
import { getAllOutlets, getNearbyOutlets, getOutletById } from '../controllers/outlet.controller.js';

const router = express.Router();

router.get('/', getAllOutlets);
router.get('/nearby', getNearbyOutlets);
router.get('/:id', getOutletById);

export default router;

