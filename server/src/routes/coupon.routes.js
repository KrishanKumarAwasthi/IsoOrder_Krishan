import express from 'express';
import { validateCoupon, getAllCoupons } from '../controllers/coupon.controller.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/', getAllCoupons);

export default router;

