import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize WebSockets
initSocket(server, process.env.CLIENT_URL);

// Start HTTP server and attempt DB connection
server.listen(PORT, async () => {
  console.log(`[Server] IsoOrder Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
  const conn = await connectDB();
  if (conn) {
    try {
      const { Outlet } = await import('./models/Outlet.model.js');
      const count = await Outlet.countDocuments();
      if (count === 0) {
        console.log('[Database] Database is empty. Auto-seeding initial outlets, menu, and users...');
        const { seedDatabase } = await import('./scripts/seed.js');
        await seedDatabase();
        console.log('[Database] Auto-seeding completed successfully!');
      }
    } catch (seedErr) {
      console.warn('[Database] Auto-seed check warning:', seedErr.message);
    }
  }
});

export { server };

