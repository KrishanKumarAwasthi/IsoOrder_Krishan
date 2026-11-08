import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import OutletSelectPage from '../pages/customer/OutletSelectPage';
import MenuPage from '../pages/customer/MenuPage';

describe('Phase 2 Customer Menu & Outlet Selection Tests', () => {
  it('renders OutletSelectPage with multiple outlets, FSSAI numbers, and filter buttons', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <OutletSelectPage />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Choose Your Outlet/i })).toBeInTheDocument();
    expect(screen.getByText(/Kondapur Outlet/i)).toBeInTheDocument();
    expect(screen.getByText(/Gachibowli Cloud Kitchen/i)).toBeInTheDocument();
    expect(screen.getAllByText(/FSSAI:/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Find Nearest Outlet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cloud Kitchens/i })).toBeInTheDocument();
  });

  it('renders MenuPage with items, category tabs, and GST label', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <MenuPage />
        </CartProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Prices include 5% GST/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Reorder Suggestions/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Chicken Dum Biryani/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Mutton Haleem/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Double Ka Meetha/i).length).toBeGreaterThanOrEqual(1);
  });

  it('clicking Add on a menu item opens customization modal with portions and add-ons', () => {
    render(
      <BrowserRouter>
        <CartProvider>
          <MenuPage />
        </CartProvider>
      </BrowserRouter>
    );

    // Click the first "Add" button
    const addButtons = screen.getAllByRole('button', { name: /Add/i });
    fireEvent.click(addButtons[0]);

    // Customization modal should open
    expect(screen.getByText(/Choose Portion Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Accompaniments \/ Extras/i)).toBeInTheDocument();
  });
});

