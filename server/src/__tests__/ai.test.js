import { predictPrepTime } from '../services/ai.service.js';

describe('Phase 5: AI Prep-Time Prediction & Constraints Tests', () => {
  it('promised prep time is always >= outlet minimum prep time', async () => {
    const mockOutlet = {
      _id: '507f1f77bcf86cd799439011',
      minimumPrepTime: 25,
    };
    const mockItems = [{ name: 'Double Ka Meetha', quantity: 1 }];

    const result = await predictPrepTime(mockOutlet, mockItems);

    expect(result.promisedMinutes).toBeGreaterThanOrEqual(25);
    expect(result.source).toBeDefined();
  });

  it('heavily loaded kitchen automatically scales estimated prep time', async () => {
    const mockOutlet = {
      _id: '507f1f77bcf86cd799439011',
      minimumPrepTime: 20,
    };
    const heavyOrder = [
      { name: 'Chicken Dum Biryani', quantity: 3 },
      { name: 'Mutton Haleem', quantity: 3 },
    ];

    const result = await predictPrepTime(mockOutlet, heavyOrder);

    // Should include extra time for large item quantity and biryani/haleem complexity
    expect(result.promisedMinutes).toBeGreaterThan(20);
  });
});

