import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';
import { Order } from '../models/Order.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { ORDER_STATUS } from '../shared/constants.js';

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Predict kitchen prep time based on current load, item count, and item complexity
export const predictPrepTime = async (outlet, items) => {
  const minimumPrepTime = outlet.minimumPrepTime || 25;

  // 1. Calculate active kitchen load (orders currently in prep at this outlet)
  let activeOrdersCount = outlet.mockActiveOrdersCount || 0;
  if (mongoose.connection.readyState === 1) {
    try {
      activeOrdersCount = await Order.countDocuments({
        outlet: outlet._id,
        status: { $in: [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING] },
      });
    } catch (e) {
      activeOrdersCount = outlet.mockActiveOrdersCount || 2;
    }
  }

  // 2. Calculate item quantity and complexity
  const totalItemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const hasHaleemOrDumBiryani = items.some((i) =>
    (i.name || '').toLowerCase().includes('biryani') || (i.name || '').toLowerCase().includes('haleem')
  );

  // 3. Fallback heuristic algorithm
  let heuristicMinutes = minimumPrepTime;
  if (activeOrdersCount > 8) {
    heuristicMinutes += 15;
  } else if (activeOrdersCount > 4) {
    heuristicMinutes += 8;
  }

  if (totalItemCount > 5) {
    heuristicMinutes += 10;
  } else if (totalItemCount > 2) {
    heuristicMinutes += 5;
  }

  if (hasHaleemOrDumBiryani) {
    heuristicMinutes += 5;
  }

  // 4. If Gemini API key is configured, query Gemini model for AI prediction
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are a kitchen operations AI for a high-volume Hyderabadi restaurant.
Estimate the realistic preparation time in minutes for this order:
- Outlet minimum prep time: ${minimumPrepTime} minutes
- Current active orders in kitchen: ${activeOrdersCount}
- Items ordered: ${items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
Reply with ONLY a single integer representing estimated preparation minutes.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const aiMinutes = parseInt(text, 10);

      if (!isNaN(aiMinutes) && aiMinutes > 0) {
        // As per brief constraint: promised time is the HIGHER of AI estimate and outlet minimum
        const finalPromisedMinutes = Math.max(aiMinutes, minimumPrepTime);
        return {
          promisedMinutes: finalPromisedMinutes,
          aiEstimate: aiMinutes,
          source: 'gemini-ai',
          activeKitchenLoad: activeOrdersCount,
        };
      }
    } catch (err) {
      console.warn('[AI Service] Gemini API call failed, falling back to heuristic:', err.message);
    }
  }

  // Brief constraint: Promised time is HIGHER of AI/heuristic estimate and outlet's minimum
  const finalPromisedMinutes = Math.max(heuristicMinutes, minimumPrepTime);
  return {
    promisedMinutes: finalPromisedMinutes,
    aiEstimate: heuristicMinutes,
    source: 'heuristic-engine',
    activeKitchenLoad: activeOrdersCount,
  };
};

// AI Reorder Suggestions from customer order history
export const getReorderSuggestions = async (customerPhone, customerId) => {
  try {
    const query = {};
    if (customerId) query.customer = customerId;
    else if (customerPhone) query.customerPhone = customerPhone;
    else return [];

    // Find previous orders of this customer
    const pastOrders = await Order.find(query).sort({ createdAt: -1 }).limit(10);
    if (!pastOrders || pastOrders.length === 0) {
      // Return top popular items
      return await MenuItem.find({ isActive: true }).limit(3);
    }

    // Count frequency of items ordered
    const itemFrequency = {};
    for (const order of pastOrders) {
      for (const item of order.items || []) {
        const id = item.menuItem?.toString();
        if (id) {
          itemFrequency[id] = (itemFrequency[id] || 0) + item.quantity;
        }
      }
    }

    const sortedItemIds = Object.keys(itemFrequency).sort(
      (a, b) => itemFrequency[b] - itemFrequency[a]
    );

    const topItems = await MenuItem.find({
      _id: { $in: sortedItemIds.slice(0, 3) },
      isActive: true,
    });

    return topItems;
  } catch (err) {
    console.error('[AI Service Error]', err);
    return [];
  }
};

