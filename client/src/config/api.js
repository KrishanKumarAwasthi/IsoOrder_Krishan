/**
 * Centralized API & WebSocket URL resolution for IsoOrder.
 * Automatically handles:
 * - Local development: defaults to http://localhost:5000/api and http://localhost:5000
 * - Production on Vercel: reads VITE_API_URL and VITE_SOCKET_URL
 * - Flexible formatting: handles with or without trailing slash and with or without '/api' suffix
 */

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return 'http://localhost:5000/api';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    // Strip trailing /api if present so socket connects to the host root
    return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  }
  return 'http://localhost:5000';
};

export const API_BASE = getApiBase();
export const SOCKET_URL = getSocketUrl();

