import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { SocketProvider } from '../context/SocketContext';

describe('IsoOrder Frontend Baseline', () => {
  it('renders landing page with headline and key sections', () => {
    render(
      <SocketProvider>
        <App />
      </SocketProvider>
    );
    expect(screen.getByRole('heading', { name: /IsoOrder/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Authentic Hyderabadi Cuisine/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Customer Order/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Kitchen Display/i })).toBeInTheDocument();
  });
});

