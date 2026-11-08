// Shared constants across client and server

export const ROLES = {
  CUSTOMER: 'customer',
  KITCHEN: 'kitchen',
  ADMIN: 'admin',
};

export const OUTLET_TYPES = {
  RETAIL: 'retail',
  CLOUD_KITCHEN: 'cloud_kitchen',
};

export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  UPI: 'upi',
  CARD: 'card',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const TIME_SLOTS = {
  ALL: 'all',
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
};

export const SOCKET_EVENTS = {
  ORDER_NEW: 'order:new',
  ORDER_STATUS_UPDATE: 'order:statusUpdate',
  ORDER_LATE_ALERT: 'order:lateAlert',
  ORDER_ESTIMATE_OVERRIDE: 'order:estimateOverride',
  KITCHEN_JOIN: 'kitchen:join',
  CUSTOMER_JOIN: 'customer:join',
  ITEM_AVAILABILITY_CHANGED: 'item:availabilityChanged',
};

