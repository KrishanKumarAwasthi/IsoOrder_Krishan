import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Utensils, AlertCircle, ChefHat, ShieldCheck, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      if (result.user.role === 'kitchen') {
        navigate('/kitchen');
      } else if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-xl">
            I
          </div>
          <span className="text-2xl font-black text-stone-900 tracking-tight">IsoOrder</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">Sign in to your account</h2>
        <p className="mt-1 text-sm text-stone-500">
          Direct ordering & kitchen control platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-stone-200 sm:rounded-2xl sm:px-10">
          {/* Demo Account Quick Switcher */}
          <div className="mb-6 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Quick Fill Demo Accounts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('customer@isoorder.com', 'customer123')}
                className="flex flex-col items-center p-2 rounded-lg bg-white border border-stone-200 hover:border-orange-500 text-xs font-medium text-stone-700 transition-colors"
              >
                <User className="w-4 h-4 text-orange-600 mb-1" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kitchen.kondapur@isoorder.com', 'kitchen123')}
                className="flex flex-col items-center p-2 rounded-lg bg-white border border-stone-200 hover:border-amber-500 text-xs font-medium text-stone-700 transition-colors"
              >
                <ChefHat className="w-4 h-4 text-amber-600 mb-1" />
                Kitchen
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@isoorder.com', 'admin123')}
                className="flex flex-col items-center p-2 rounded-lg bg-white border border-stone-200 hover:border-stone-800 text-xs font-medium text-stone-700 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-stone-700 mb-1" />
                Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-orange-600 hover:text-orange-700">
              Sign up & get 100 reward points
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

