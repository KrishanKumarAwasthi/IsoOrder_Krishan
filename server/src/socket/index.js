import { Server } from 'socket.io';
import { SOCKET_EVENTS } from '../shared/constants.js';

let ioInstance = null;

export const initSocket = (server, clientUrl) => {
  const allowedOrigins = clientUrl
    ? clientUrl.split(',').map((u) => u.trim().replace(/\/+$/, ''))
    : [];

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || !clientUrl || clientUrl === '*') return callback(null, true);
        const normalized = origin.replace(/\/+$/, '');
        if (
          allowedOrigins.includes(normalized) ||
          normalized.endsWith('.vercel.app') ||
          normalized.includes('localhost')
        ) {
          return callback(null, true);
        }
        callback(null, false);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join outlet kitchen room
    socket.on(SOCKET_EVENTS.KITCHEN_JOIN, ({ outletId }) => {
      if (outletId) {
        const room = `outlet:${outletId}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} joined kitchen room ${room}`);
      }
    });

    // Join individual order room for customer tracking
    socket.on(SOCKET_EVENTS.CUSTOMER_JOIN, ({ orderId }) => {
      if (orderId) {
        const room = `order:${orderId}`;
        socket.join(room);
        console.log(`[Socket.IO] Socket ${socket.id} joined customer order room ${room}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized yet!');
  }
  return ioInstance;
};

