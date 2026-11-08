import { predictPrepTime, getReorderSuggestions } from '../services/ai.service.js';
import { Outlet } from '../models/Outlet.model.js';

export const getEstimatedPrepTime = async (req, res, next) => {
  try {
    const { outletId, items } = req.query;

    const outlet = await Outlet.findById(outletId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }

    let parsedItems = [];
    if (items) {
      try {
        parsedItems = JSON.parse(items);
      } catch (e) {
        parsedItems = [{ name: 'Chicken Dum Biryani', quantity: 1 }];
      }
    }

    const prediction = await predictPrepTime(outlet, parsedItems);
    res.status(200).json({ success: true, ...prediction });
  } catch (error) {
    next(error);
  }
};

export const getCustomerSuggestions = async (req, res, next) => {
  try {
    const customerId = req.user?._id;
    const phone = req.query.phone || req.user?.phone;

    const suggestions = await getReorderSuggestions(phone, customerId);
    res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    next(error);
  }
};

