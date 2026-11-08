import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import CartPage from '../pages/customer/CartPage';
import OrderConfirmationPage from '../pages/customer/OrderConfirmationPage';

// Helper component to preload items into cart for testing
function CartWithItems() {
  const { addToCart } = useCart();

  React.useEffect(() => {
    addToCart(
      {
        _id: 'item_ck_biryani',
        name: 'Chicken Dum Biryani',
        basePrice: 380,
        isVeg: false,
      },
      { name: 'Family Pack (Serves 3-4)', price: 420 },
      [],
      1
    );
  }, []);

  return <CartPage />;
}

describe('Phase 3: Cart and Checkout Tests', () => {
  it('renders empty cart view when no items are present', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CartPage />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse Menu/i })).toBeInTheDocument();
  });

  it('renders cart items, subtotal, coupon input and payment button when items exist', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <CartWithItems />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Review & Checkout/i })).toBeInTheDocument();
    expect(screen.getByText(/Chicken Dum Biryani/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. WELCOME10/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proceed to Pay/i })).toBeInTheDocument();
  });

  it('renders order confirmation page with order ID and promised ready time', async () => {
    render(
      <BrowserRouter>
        <OrderConfirmationPage />
      </BrowserRouter>
    );

    expect(await screen.findByRole('heading', { name: /Order Confirmed!/i })).toBeInTheDocument();
    expect(await screen.findByText(/Estimated Kitchen Ready Time:/i)).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Track Live Kitchen Status/i })).toBeInTheDocument();
  });
});

