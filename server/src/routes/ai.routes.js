import express from 'express';
import { getEstimatedPrepTime, getCustomerSuggestions } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      await protect(req, res, next);
      return;
    } catch (e) {
      // Fall through
    }
  }
  next();
};

router.get('/prep-time', getEstimatedPrepTime);
router.get('/suggestions', optionalAuth, getCustomerSuggestions);

export default router;

