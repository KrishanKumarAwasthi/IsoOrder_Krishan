import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

describe('Auth Pages Tests', () => {
  it('renders login form and demo account quick switcher buttons', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Sign in to your account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kitchen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('clicking demo Customer button fills the email and password inputs', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const customerBtn = screen.getByRole('button', { name: /Customer/i });
    fireEvent.click(customerBtn);

    const emailInput = screen.getByPlaceholderText('name@example.com');
    expect(emailInput.value).toBe('customer@isoorder.com');
  });

  it('renders register form with DPDP compliance checkbox', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Create your account/i })).toBeInTheDocument();
    expect(screen.getByText(/100 Reward Points/i)).toBeInTheDocument();
    expect(screen.getByText(/DPDP Act 2023/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });
});

