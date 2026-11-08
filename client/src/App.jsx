import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useSocket } from './context/SocketContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OutletSelectPage from './pages/customer/OutletSelectPage';
import MenuPage from './pages/customer/MenuPage';
import CartPage from './pages/customer/CartPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import KitchenDisplayPage from './pages/kitchen/KitchenDisplayPage';
import AdminMenuCMS from './pages/admin/AdminMenuCMS';
import PartyOrderPage from './pages/customer/PartyOrderPage';
import ProtectedRoute from './components/ProtectedRoute';
import {
  UtensilsCrossed,
  ChefHat,
  LayoutDashboard,
  Sparkles,
  LogOut,
  User as UserIcon,
  LogIn,
  ShoppingBag,
  MapPin,
  PartyPopper,
} from 'lucide-react';

function Navigation() {
  const { isConnected } = useSocket();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount, selectedOutlet } = useCart();

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg">
              I
            </div>
            <div>
              <h1 className="font-bold text-lg text-stone-900 leading-tight">IsoOrder</h1>
              <p className="text-xs text-stone-500">Authentic Hyderabadi Cuisine</p>
            </div>
          </Link>

          {/* Quick Outlet Indicator in Nav */}
          <Link
            to="/outlets"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-600" />
            <span className="truncate max-w-[150px]">{selectedOutlet?.name || 'Select Outlet'}</span>
          </Link>

          <Link
            to="/kitchen"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors border border-amber-200"
          >
            <ChefHat className="w-3.5 h-3.5 text-amber-600" />
            Kitchen KDS
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isConnected ? 'Live Connected' : 'Connecting...'}
          </span>

          {/* Cart Icon in Nav */}
          <Link
            to="/cart"
            className="relative p-2 rounded-lg text-stone-700 hover:bg-stone-100 transition-colors"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-stone-900">{user.name}</p>
                <p className="text-[10px] text-orange-600 font-bold uppercase">{user.role} &bull; {user.loyaltyPoints} pts</p>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors shadow-sm"
              >
                Sign Up (+100 Pts)
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      <Navigation />

      {/* Main Hero */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" /> Direct Ordering Platform & Kitchen Display
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 mb-4">
          Hyderabad's Finest Biryani, <br />
          <span className="text-orange-600">Fresh from Kitchen to You.</span>
        </h2>
        <p className="text-stone-600 max-w-xl text-lg mb-8">
          Order direct, skip the commissions, earn loyalty points on every meal, and watch your order move through the kitchen live.
        </p>

        {/* Quick Role Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl text-left">
          <Link
            to="/outlets"
            className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-orange-500 transition-colors block"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-lg mb-1">Customer Order</h3>
            <p className="text-sm text-stone-500 mb-4">Browse outlets, order dum biryani, haleem & desserts with live updates.</p>

          </Link>

          <Link
            to="/kitchen"
            className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-amber-500 transition-colors block"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <ChefHat className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-lg mb-1">Kitchen Display (KDS)</h3>
            <p className="text-sm text-stone-500 mb-4">High-contrast, 2-metre readable screen with stages & late timers.</p>

          </Link>

          <Link
            to="/admin"
            className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm hover:border-stone-800 transition-colors block"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-lg mb-1">Central Admin CMS</h3>
            <p className="text-sm text-stone-500 mb-4">Manage menus, city pricing, outlet stock toggles and analytics.</p>

          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <p>IsoOrder Restaurant Platform &bull; FSSAI Licenced Outlets &bull; Prices inclusive of 5% GST</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/outlets" element={<OutletSelectPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/party" element={<PartyOrderPage />} />
            <Route path="/kitchen" element={<KitchenDisplayPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                  <AdminMenuCMS />
                </ProtectedRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
