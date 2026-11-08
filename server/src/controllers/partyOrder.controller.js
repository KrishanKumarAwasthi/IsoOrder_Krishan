import { PartyOrder } from '../models/PartyOrder.model.js';
import { Outlet } from '../models/Outlet.model.js';

export const createPartyOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      outletId,
      eventDate,
      guestCount,
      packageType,
      specialRequests,
    } = req.body;

    // Validate minimum notice (at least 24 hours)
    const noticeCheck = PartyOrder.validateMinimumNotice(eventDate, 24);
    if (!noticeCheck.valid) {
      return res.status(400).json({
        error: `Party and bulk orders require at least ${noticeCheck.minimumRequired} hours advance notice. Provided notice: ${noticeCheck.hoursProvided} hours.`,
      });
    }

    const count = parseInt(guestCount) || 15;
    if (count < 15) {
      return res.status(400).json({ error: 'Party orders require a minimum of 15 guests' });
    }

    const outlet = await Outlet.findById(outletId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderReference = `PARTY-${randomSuffix}`;

    // Compute estimated price (~₹600 per guest)
    const perGuestCost = packageType === 'nizami_feast' ? 850 : 600;
    const estimatedBudget = count * perGuestCost;

    const partyOrder = await PartyOrder.create({
      orderReference,
      customerName,
      customerPhone,
      customerEmail,
      outlet: outlet._id,
      eventDate: new Date(eventDate),
      guestCount: count,
      packageType: packageType || 'royal_biryani_celebration',
      estimatedBudget,
      specialRequests: specialRequests || '',
      status: 'pending_confirmation',
    });

    res.status(201).json({
      success: true,
      message: 'Party order submitted! Our Catering Manager will confirm within 2 hours.',
      partyOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPartyOrders = async (req, res, next) => {
  try {
    const orders = await PartyOrder.find().populate('outlet').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, partyOrders: orders });
  } catch (error) {
    next(error);
  }
};

export const updatePartyOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, managerNotes } = req.body;

    const partyOrder = await PartyOrder.findById(id).populate('outlet');
    if (!partyOrder) {
      return res.status(404).json({ error: 'Party order not found' });
    }

    partyOrder.status = status || partyOrder.status;
    partyOrder.confirmedByManager = req.user?.name || 'Catering Manager';
    if (managerNotes) partyOrder.managerNotes = managerNotes;

    await partyOrder.save();

    res.status(200).json({
      success: true,
      message: `Party order marked as ${partyOrder.status}`,
      partyOrder,
    });
  } catch (error) {
    next(error);
  }
};

