import { Coupon } from '../models/Coupon.model.js';

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code' });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    const check = coupon.isValidForOrder(orderSubtotal);

    if (!check.valid) {
      return res.status(400).json({ error: check.message });
    }

    const discountAmount = coupon.calculateDiscount(orderSubtotal);

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ isActive: true });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

