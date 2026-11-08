import { Coupon } from '../models/Coupon.model.js';
import { Order } from '../models/Order.model.js';
import { ORDER_STATUS } from '../shared/constants.js';

describe('Model Business Logic Unit Tests', () => {
  describe('Coupon Model Logic', () => {
    it('should correctly validate active and non-expired coupon', () => {
      const coupon = new Coupon({
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 200,
        validFrom: new Date(Date.now() - 10000),
        validTo: new Date(Date.now() + 1000000),
        isActive: true,
      });

      const checkValid = coupon.isValidForOrder(300);
      expect(checkValid.valid).toBe(true);

      const checkLowOrder = coupon.isValidForOrder(100);
      expect(checkLowOrder.valid).toBe(false);
      expect(checkLowOrder.message).toContain('Minimum order value of ₹200');
    });

    it('should calculate percentage and flat discounts correctly', () => {
      const percentageCoupon = new Coupon({
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 50,
      });
      // 10% of 600 is 60, capped at 50
      expect(percentageCoupon.calculateDiscount(600)).toBe(50);
      // 10% of 300 is 30, uncapped
      expect(percentageCoupon.calculateDiscount(300)).toBe(30);

      const flatCoupon = new Coupon({
        code: 'FLAT50',
        discountType: 'flat',
        discountValue: 50,
      });
      expect(flatCoupon.calculateDiscount(400)).toBe(50);
    });
  });

  describe('Order Model Logic', () => {
    it('should detect when an order is late', () => {
      const pastTime = new Date(Date.now() - 10 * 60 * 1000); // 10 mins ago
      const order = new Order({
        orderId: 'WEB-778146',
        customer: '507f1f77bcf86cd799439011',
        customerName: 'Test Customer',
        customerPhone: '9876543210',
        outlet: '507f1f77bcf86cd799439012',
        subtotal: 1000,
        gst: 50,
        total: 1050,
        promisedTime: pastTime,
        status: ORDER_STATUS.PREPARING,
      });

      expect(order.isLate()).toBe(true);
      expect(order.minutesLate()).toBeGreaterThanOrEqual(9);
    });

    it('should detect when an on-time order is not late', () => {
      const futureTime = new Date(Date.now() + 20 * 60 * 1000); // 20 mins from now
      const order = new Order({
        orderId: 'WEB-778120',
        customer: '507f1f77bcf86cd799439011',
        customerName: 'Test Customer',
        customerPhone: '9876543210',
        outlet: '507f1f77bcf86cd799439012',
        subtotal: 1180,
        gst: 59,
        total: 1180,
        promisedTime: futureTime,
        status: ORDER_STATUS.PREPARING,
      });

      expect(order.isLate()).toBe(false);
      expect(order.minutesLate()).toBe(0);
    });
  });
});

