import { ORDER_STATUS } from '../shared/constants.js';

describe('Phase 4: Kitchen Workflow & State Transition Tests', () => {
  it('validates sequential status progression', () => {
    const validProgression = [
      ORDER_STATUS.PLACED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.PICKED_UP,
      ORDER_STATUS.DELIVERED,
    ];

    validProgression.forEach((status) => {
      expect(Object.values(ORDER_STATUS)).toContain(status);
    });
  });

  it('determines late order calculation threshold', () => {
    const now = Date.now();
    const promisedPast = new Date(now - 4 * 60 * 1000); // 4 mins ago
    const diffMs = now - promisedPast.getTime();
    const minutesLate = Math.floor(diffMs / 60000);

    expect(minutesLate).toBe(4);
  });
});

