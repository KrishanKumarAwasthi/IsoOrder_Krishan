import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../shared/constants.js';

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    portion: {
      name: { type: String, default: 'Standard' },
      price: { type: Number, default: 0 },
    },
    addOns: [
      {
        name: { type: String },
        price: { type: Number, default: 0 },
      },
    ],
    unitPrice: {
      type: Number,
      required: true,
    },
    itemTotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    gst: {
      type: Number,
      required: true,
      default: 0, // 5% GST breakdown
    },
    discount: {
      type: Number,
      default: 0,
    },
    loyaltyPointsUsed: {
      type: Number,
      default: 0,
    },
    loyaltyDiscount: {
      type: Number,
      default: 0,
    },
    loyaltyPointsEarned: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHODS),
      default: PAYMENT_METHODS.UPI,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true,
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
    promisedTime: {
      type: Date,
      required: true,
    },
    aiEstimatedMinutes: {
      type: Number,
      default: 30,
    },
    managerOverrideMinutes: {
      type: Number,
      default: null,
    },
    actualReadyTime: {
      type: Date,
      default: null,
    },
    deliveryAddress: {
      addressLine: { type: String },
      area: { type: String },
      city: { type: String, default: 'Hyderabad' },
      phone: { type: String },
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helper to determine if order is late
orderSchema.methods.isLate = function () {
  if (this.status === ORDER_STATUS.READY || this.status === ORDER_STATUS.PICKED_UP || this.status === ORDER_STATUS.DELIVERED) {
    if (this.actualReadyTime) {
      return this.actualReadyTime > this.promisedTime;
    }
    return false;
  }
  return new Date() > this.promisedTime;
};

// Minutes late
orderSchema.methods.minutesLate = function () {
  const referenceTime = this.actualReadyTime || new Date();
  const diffMs = referenceTime.getTime() - this.promisedTime.getTime();
  return diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;
};

export const Order = mongoose.model('Order', orderSchema);

