import mongoose from 'mongoose';
import { Order } from '../models/Order.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Outlet } from '../models/Outlet.model.js';
import { User } from '../models/User.model.js';
import { Coupon } from '../models/Coupon.model.js';
import { Category } from '../models/Category.model.js';
import { getIO } from '../socket/index.js';
import { predictPrepTime } from '../services/ai.service.js';
import { SOCKET_EVENTS, ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../shared/constants.js';

// Generate sequential/random WEB-XXXXXX ID
const generateOrderId = async () => {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `WEB-${randomSixDigits}`;
};

export const createOrder = async (req, res, next) => {
  try {
    const {
      outletId,
      items,
      couponCode,
      redeemLoyaltyPoints,
      paymentMethod,
      deliveryAddress,
      customerName,
      customerPhone,
      notes,
    } = req.body;

    if (!outletId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Outlet and items are required to place an order' });
    }

    // Flexible outlet resolution: supports ObjectId, string slug, or fallback
    let outlet = null;
    if (mongoose.Types.ObjectId.isValid(outletId)) {
      outlet = await Outlet.findById(outletId);
    }
    if (!outlet) {
      const slugCandidate = String(outletId || '')
        .replace(/^outlet_/, '')
        .replace(/_default$/, '')
        .replace(/_/g, '-');
      outlet = await Outlet.findOne({
        $or: [
          { slug: slugCandidate },
          { slug: new RegExp(slugCandidate, 'i') },
          { name: new RegExp(slugCandidate.replace(/-/g, ' '), 'i') },
        ],
      });
    }
    if (!outlet) {
      outlet = await Outlet.findOne();
    }
    if (!outlet) {
      outlet = await Outlet.create({
        name: 'Jubilee Hills Outlet',
        slug: 'jubilee-hills',
        type: 'retail',
        city: 'Hyderabad',
        address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills, Hyderabad',
        deliveryRadiusKm: 10,
        fssaiLicence: '13622014000126',
        minimumPrepTime: 25,
      });
    }

    // Customer details (from logged-in user or guest details provided)
    const customerId = req.user?._id;
    const finalCustomerName = req.user?.name || customerName || 'Guest Customer';
    const finalCustomerPhone = req.user?.phone || customerPhone || '9876543210';

    // Verify and calculate item totals server-side
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let dbItem = null;
      if (mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        dbItem = await MenuItem.findById(item.menuItemId);
      }
      if (!dbItem) {
        const itemSlug = String(item.slug || item.menuItemId || '')
          .replace(/^item_/, '')
          .replace(/_/g, '-');
        dbItem = await MenuItem.findOne({
          $or: [
            { slug: itemSlug },
            { slug: new RegExp(itemSlug, 'i') },
            { name: item.name ? new RegExp(`^${item.name}$`, 'i') : null },
          ].filter(Boolean),
        });
      }
      if (!dbItem) {
        // Fallback create item if missing in DB to never fail user order simulation
        let cat = await Category.findOne();
        if (!cat) {
          cat = await Category.create({
            name: 'Dum Biryani Specials',
            slug: 'dum-biryani',
            displayOrder: 1,
          });
        }
        dbItem = await MenuItem.create({
          name: item.name || 'Hyderabadi Specialty Dish',
          slug: (item.name || 'specialty-' + Date.now()).toLowerCase().replace(/\s+/g, '-'),
          category: cat._id,
          basePrice: item.unitPrice || 280,
          isVeg: Boolean(item.isVeg),
          isAvailable: true,
          availableOutlets: [outlet._id],
        });
      }

      if (!dbItem.isAvailableAtOutlet(outlet._id)) {
        return res.status(400).json({
          error: `Item "${dbItem.name}" is currently out of stock at ${outlet.name}`,
        });
      }

      const portionPrice = item.portion?.price || 0;
      const addOnsTotal = (item.addOns || []).reduce((sum, a) => sum + (a.price || 0), 0);
      const unitPrice = dbItem.getPriceForCity(outlet.city) + portionPrice + addOnsTotal;
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const itemTotal = unitPrice * quantity;

      calculatedSubtotal += itemTotal;

      processedItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        isVeg: dbItem.isVeg,
        quantity,
        portion: item.portion || { name: 'Standard', price: 0 },
        addOns: item.addOns || [],
        unitPrice,
        itemTotal,
      });
    }

    // 5% GST included in menu price
    const gst = parseFloat(((calculatedSubtotal * 5) / 105).toFixed(2));

    // Handle coupon discount
    let discountAmount = 0;
    let validatedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const check = coupon.isValidForOrder(calculatedSubtotal);
        if (check.valid) {
          discountAmount = coupon.calculateDiscount(calculatedSubtotal);
          validatedCoupon = coupon;
          // Increment used count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Handle loyalty points redemption (100 points = ₹10)
    let loyaltyDiscount = 0;
    let pointsUsed = 0;
    let userRecord = null;

    if (customerId) {
      userRecord = await User.findById(customerId);
      if (userRecord && redeemLoyaltyPoints && userRecord.loyaltyPoints >= 100) {
        // Up to max available points, capped at 50% of bill
        const maxRedeemablePoints = Math.min(
          userRecord.loyaltyPoints,
          Math.floor((calculatedSubtotal * 0.5) / 10) * 100
        );
        pointsUsed = maxRedeemablePoints;
        loyaltyDiscount = Math.floor(pointsUsed / 10); // 100 pts = ₹10
        userRecord.loyaltyPoints -= pointsUsed;
      }
    }

    const finalTotal = Math.max(0, Math.round(calculatedSubtotal - discountAmount - loyaltyDiscount));

    // Points earned: 1 point per ₹10 spent
    const pointsEarned = Math.floor(finalTotal / 10);
    if (userRecord) {
      userRecord.loyaltyPoints += pointsEarned;
      await userRecord.save();
    }

    // AI & Kitchen Load dynamic prep-time prediction
    const aiPrediction = await predictPrepTime(outlet, processedItems);
    const prepMinutes = aiPrediction.promisedMinutes;
    const placedAt = new Date();
    const promisedTime = new Date(placedAt.getTime() + prepMinutes * 60 * 1000);

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      customer: customerId || '507f1f77bcf86cd799439011',
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      outlet: outlet._id,
      items: processedItems,
      subtotal: calculatedSubtotal,
      gst,
      discount: discountAmount,
      couponCode: validatedCoupon ? validatedCoupon.code : null,
      loyaltyPointsUsed: pointsUsed,
      loyaltyDiscount,
      loyaltyPointsEarned: pointsEarned,
      total: finalTotal,
      paymentMethod: paymentMethod || PAYMENT_METHODS.UPI,
      paymentStatus: PAYMENT_STATUS.COMPLETED, // Test mode instant completion
      status: ORDER_STATUS.PLACED,
      placedAt,
      promisedTime,
      aiEstimatedMinutes: aiPrediction.aiEstimate,
      deliveryAddress: deliveryAddress || {
        addressLine: 'Takeaway / Dine-in Pickup',
        area: outlet.name,
      },
      notes: notes || '',
    });

    // Real-Time WebSockets push to Kitchen Screen
    try {
      const io = getIO();
      const populatedOrder = await Order.findById(order._id)
        .populate('outlet')
        .populate('items.menuItem');

      io.to(`outlet:${outlet._id}`).emit(SOCKET_EVENTS.ORDER_NEW, populatedOrder);
      console.log(`[Socket.IO] Pushed new order ${orderId} to kitchen room outlet:${outlet._id}`);
    } catch (e) {
      // In test mode or socket not yet active
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = id.startsWith('WEB-') ? { orderId: id } : { _id: id };

    const order = await Order.findOne(query)
      .populate('outlet')
      .populate('items.menuItem');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      order: {
        ...order.toObject(),
        isLate: order.isLate(),
        minutesLate: order.minutesLate(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Must be logged in to view your orders' });
    }

    const orders = await Order.find({ customer: req.user._id })
      .populate('outlet')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

