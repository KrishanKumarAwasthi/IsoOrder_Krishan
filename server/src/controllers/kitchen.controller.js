import { Order } from '../models/Order.model.js';
import { getIO } from '../socket/index.js';
import { SOCKET_EVENTS, ORDER_STATUS } from '../shared/constants.js';

export const getKitchenOrders = async (req, res, next) => {
  try {
    const { outletId } = req.query;

    if (!outletId) {
      return res.status(400).json({ error: 'Outlet ID is required to fetch kitchen orders' });
    }

    // Fetch active orders (not yet delivered or cancelled)
    const activeOrders = await Order.find({
      outlet: outletId,
      status: { $nin: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED] },
    })
      .populate('outlet')
      .populate('items.menuItem')
      .sort({ placedAt: 1 });

    const processed = activeOrders.map((order) => ({
      ...order.toObject(),
      isLate: order.isLate(),
      minutesLate: order.minutesLate(),
    }));

    res.status(200).json({
      success: true,
      count: processed.length,
      orders: processed,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ error: `Invalid status transition: ${status}` });
    }

    const order = await Order.findById(id).populate('outlet');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (status === ORDER_STATUS.READY) {
      order.actualReadyTime = new Date();
    }

    await order.save();

    // Real-Time Socket.IO broadcasts
    try {
      const io = getIO();
      const payload = {
        orderId: order.orderId,
        id: order._id,
        outletId: order.outlet._id,
        status: order.status,
        actualReadyTime: order.actualReadyTime,
        promisedTime: order.promisedTime,
        isLate: order.isLate(),
        minutesLate: order.minutesLate(),
      };

      // Push to kitchen room
      io.to(`outlet:${order.outlet._id}`).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATE, payload);

      // Push to customer order room
      io.to(`order:${order.orderId}`).emit(SOCKET_EVENTS.ORDER_STATUS_UPDATE, payload);

      console.log(`[Socket.IO] Broadcasted status update for ${order.orderId} -> ${status}`);
    } catch (e) {
      // In test mode or socket not yet active
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const overrideOrderEstimate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { extraMinutes, newPromisedTime } = req.body;

    const order = await Order.findById(id).populate('outlet');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let updatedTime;
    if (newPromisedTime) {
      updatedTime = new Date(newPromisedTime);
    } else if (extraMinutes) {
      updatedTime = new Date(order.promisedTime.getTime() + parseInt(extraMinutes) * 60 * 1000);
      order.managerOverrideMinutes = parseInt(extraMinutes);
    } else {
      return res.status(400).json({ error: 'extraMinutes or newPromisedTime is required' });
    }

    order.promisedTime = updatedTime;
    await order.save();

    // Broadcast updated estimate via Socket.IO
    try {
      const io = getIO();
      const payload = {
        orderId: order.orderId,
        promisedTime: order.promisedTime,
        managerOverrideMinutes: order.managerOverrideMinutes,
      };

      io.to(`outlet:${order.outlet._id}`).emit(SOCKET_EVENTS.ORDER_ESTIMATE_OVERRIDE, payload);
      io.to(`order:${order.orderId}`).emit(SOCKET_EVENTS.ORDER_ESTIMATE_OVERRIDE, payload);
    } catch (e) {
      // Test mode
    }

    res.status(200).json({
      success: true,
      message: 'Promised estimate updated successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

