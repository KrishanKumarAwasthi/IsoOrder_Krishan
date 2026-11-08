import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LayoutDashboard, ArrowLeft, LogIn } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading, login } = useAuth();
  const location = useLocation();
  const [isSwitching, setIsSwitching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const isRoleAllowed =
    !allowedRoles.length || (user && allowedRoles.includes(user.role));

  if (!isAuthenticated || !isRoleAllowed) {
    const handleSwitchToAdmin = async () => {
      setIsSwitching(true);
      setErrorMsg('');
      try {
        const res = await login('admin@isoorder.in', 'Test@1234');
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to switch to Admin account.');
        }
      } catch (err) {
        setErrorMsg(err.message || 'Error signing in.');
      } finally {
        setIsSwitching(false);
      }
    };

    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Administrator Access Required
          </h2>

          <p className="text-sm text-stone-600 mb-6">
            {isAuthenticated
              ? `You are currently logged in as a ${user?.role?.toUpperCase()} (${user?.name}). The Central Menu CMS requires an Administrator account.`
              : 'You need an Administrator or Kitchen Staff account to access the Central Menu CMS.'}
          </p>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSwitchToAdmin}
              disabled={isSwitching}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSwitching ? (
                <span>Logging into Admin...</span>
              ) : (
                <>
                  <LayoutDashboard className="w-4 h-4" />
                  <span>1-Click Switch to Admin Demo Account</span>
                </>
              )}
            </button>

            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign in with different credentials
            </Link>

            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
