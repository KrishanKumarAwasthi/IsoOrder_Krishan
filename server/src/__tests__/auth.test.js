import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { ROLES } from '../shared/constants.js';

describe('Auth Middleware Unit Tests', () => {
  const JWT_SECRET = 'supersecretjwtkey_at_least_32_characters_long_isoorder_2026';

  describe('requireRole middleware', () => {
    it('should allow access if user has the required role', () => {
      const req = { user: { role: ROLES.ADMIN } };
      const res = {};
      const next = jest.fn();

      const middleware = requireRole(ROLES.ADMIN, ROLES.KITCHEN);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny access (403) if user does not have the required role', () => {
      const req = { user: { role: ROLES.CUSTOMER } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      const middleware = requireRole(ROLES.ADMIN);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Access denied') })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('protect middleware', () => {
    it('should return 401 if no Authorization header is provided', async () => {
      const req = { headers: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('no token provided') })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      const req = {
        headers: {
          authorization: 'Bearer invalid_token_xyz',
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
