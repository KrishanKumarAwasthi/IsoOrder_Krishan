import { Coupon } from '../models/Coupon.model.js';
import { Order } from '../models/Order.model.js';
import { ORDER_STATUS, PAYMENT_METHODS } from '../shared/constants.js';

describe('Phase 3: Cart, Coupon & Order Logic Tests', () => {
  describe('Coupon Calculations', () => {
    it('percentage coupon applies correct discount capped by maxDiscountAmount', () => {
      const coupon = new Coupon({
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 200,
        maxDiscountAmount: 100,
        validTo: new Date(Date.now() + 100000),
      });

      // 10% of 1500 = 150, capped at 100
      expect(coupon.calculateDiscount(1500)).toBe(100);
      // 10% of 500 = 50, below 100
      expect(coupon.calculateDiscount(500)).toBe(50);
    });

    it('flat coupon applies exact discount value', () => {
      const coupon = new Coupon({
        code: 'BIRYANI50',
        discountType: 'flat',
        discountValue: 50,
        minOrderValue: 500,
        validTo: new Date(Date.now() + 100000),
      });

      expect(coupon.calculateDiscount(640)).toBe(50);
    });
  });

  describe('Order Creation & Tax Calculations', () => {
    it('5% GST is correctly partitioned from menu price', () => {
      const totalInclusive = 1180;
      const gst = parseFloat(((totalInclusive * 5) / 105).toFixed(2));
      const preTaxSubtotal = parseFloat((totalInclusive - gst).toFixed(2));

      expect(gst).toBe(56.19);
      expect(preTaxSubtotal).toBe(1123.81);
    });

    it('creates an order matching sample format WEB-XXXXXX', () => {
      const order = new Order({
        orderId: 'WEB-778120',
        customer: '507f1f77bcf86cd799439011',
        customerName: 'Rao Bahadur',
        customerPhone: '9876543210',
        outlet: '507f1f77bcf86cd799439012',
        items: [
          {
            menuItem: '507f1f77bcf86cd799439013',
            name: 'Chicken Dum Biryani (Family Pack)',
            quantity: 1,
            unitPrice: 800,
            itemTotal: 800,
          },
          {
            menuItem: '507f1f77bcf86cd799439014',
            name: 'Double Ka Meetha',
            quantity: 2,
            unitPrice: 190,
            itemTotal: 380,
          },
        ],
        subtotal: 1180,
        gst: 56.19,
        total: 1180,
        paymentMethod: PAYMENT_METHODS.UPI,
        promisedTime: new Date(Date.now() + 30 * 60 * 1000),
        status: ORDER_STATUS.PREPARING,
      });

      expect(order.orderId).toMatch(/^WEB-\d{6}$/);
      expect(order.items.length).toBe(2);
      expect(order.total).toBe(1180);
    });
  });
});

