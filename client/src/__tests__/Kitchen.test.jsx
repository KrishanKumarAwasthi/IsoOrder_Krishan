import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import KitchenDisplayPage from '../pages/kitchen/KitchenDisplayPage';
import OrderTrackingPage from '../pages/customer/OrderTrackingPage';

describe('Phase 4: Kitchen Display & Real-Time Tracking Tests', () => {
  it('renders KitchenDisplayPage with 4 KDS stage columns and sample orders', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <KitchenDisplayPage />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /KITCHEN DISPLAY SYSTEM/i })).toBeInTheDocument();
    expect(screen.getByText(/1\. New Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. In Prep/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Ready for Pickup/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Handed Off/i)).toBeInTheDocument();

    // Check sample order IDs from brief
    expect(screen.getByText('WEB-778120')).toBeInTheDocument();
    expect(screen.getByText('WEB-778131')).toBeInTheDocument();
    expect(screen.getByText('WEB-778146')).toBeInTheDocument();
    expect(screen.getByText(/LATE BY 4 MINS/i)).toBeInTheDocument();
  });

  it('renders OrderTrackingPage with live tracker and order status stepper', async () => {
    render(
      <BrowserRouter>
        <SocketProvider>
          <OrderTrackingPage />
        </SocketProvider>
      </BrowserRouter>
    );

    expect(await screen.findByText(/Live Kitchen Tracker/i)).toBeInTheDocument();
    expect(await screen.findByText(/Kitchen Preparing/i)).toBeInTheDocument();
    expect(await screen.findByText(/Ready for Pickup/i)).toBeInTheDocument();
    expect(await screen.findByText(/WhatsApp & SMS Live Updates Active/i)).toBeInTheDocument();
  });
});

