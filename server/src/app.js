import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import outletRoutes from './routes/outlet.routes.js';
import menuRoutes from './routes/menu.routes.js';
import adminRoutes from './routes/admin.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import orderRoutes from './routes/order.routes.js';
import kitchenRoutes from './routes/kitchen.routes.js';
import aiRoutes from './routes/ai.routes.js';
import partyOrderRoutes from './routes/partyOrder.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting single, comma-separated, and Vercel preview domains
const configuredClientUrl = process.env.CLIENT_URL;
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // If no CLIENT_URL configured or set to wildcard
      if (!configuredClientUrl || configuredClientUrl === '*') return callback(null, true);

      // Parse comma-separated origins and normalize trailing slashes
      const allowedOrigins = configuredClientUrl
        .split(',')
        .map((u) => u.trim().replace(/\/+$/, ''));
      const normalizedOrigin = origin.replace(/\/+$/, '');

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.includes('localhost')
      ) {
        return callback(null, true);
      }

      callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
    },
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.use('/api/health', healthRoutes);

// Auth endpoints
app.use('/api/auth', authRoutes);

// Outlets endpoints
app.use('/api/outlets', outletRoutes);

// Menu endpoints
app.use('/api/menu', menuRoutes);

// Admin CMS endpoints
app.use('/api/admin', adminRoutes);

// Coupon endpoints
app.use('/api/coupons', couponRoutes);

// Order endpoints
app.use('/api/orders', orderRoutes);

// Kitchen KDS endpoints
app.use('/api/kitchen', kitchenRoutes);

// AI & Automation endpoints
app.use('/api/ai', aiRoutes);

// Party & Bulk Catering Orders
app.use('/api/party-orders', partyOrderRoutes);

// Analytics Dashboard
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'IsoOrder API Server Running' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;

