import { MenuItem } from '../models/MenuItem.model.js';
import { Category } from '../models/Category.model.js';
import mongoose from 'mongoose';

describe('Phase 2: Menu and Outlets Logic Tests', () => {
  describe('MenuItem City Pricing & Outlet Availability', () => {
    const dummyOutletId1 = new mongoose.Types.ObjectId();
    const dummyOutletId2 = new mongoose.Types.ObjectId();
    const dummyCategoryId = new mongoose.Types.ObjectId();

    const item = new MenuItem({
      name: 'Chicken Dum Biryani',
      slug: 'chicken-dum-biryani',
      category: dummyCategoryId,
      basePrice: 380,
      priceByCity: new Map([
        ['Hyderabad', 380],
        ['Bangalore', 420],
      ]),
      isVeg: false,
      outletAvailability: [
        { outlet: dummyOutletId1, isAvailable: true },
        { outlet: dummyOutletId2, isAvailable: false },
      ],
    });

    it('returns city specific price when configured', () => {
      expect(item.getPriceForCity('Hyderabad')).toBe(380);
      expect(item.getPriceForCity('Bangalore')).toBe(420);
      // Falls back to basePrice for unknown city
      expect(item.getPriceForCity('Mumbai')).toBe(380);
    });

    it('correctly reports outlet availability', () => {
      expect(item.isAvailableAtOutlet(dummyOutletId1)).toBe(true);
      expect(item.isAvailableAtOutlet(dummyOutletId2)).toBe(false);
      // If outlet not in array, defaults to true
      const otherOutletId = new mongoose.Types.ObjectId();
      expect(item.isAvailableAtOutlet(otherOutletId)).toBe(true);
    });

    it('reports item unavailable if isActive is false', () => {
      item.isActive = false;
      expect(item.isAvailableAtOutlet(dummyOutletId1)).toBe(false);
      item.isActive = true; // reset
    });
  });
});

