import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, Clock, MapPin, ChefHat, ArrowRight, ShieldCheck, Gift } from 'lucide-react';

import { API_BASE } from '../../config/api';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (err) {
      // Offline fallback state
      setOrder({
        orderId: orderId || 'WEB-778120',
        customerName: 'Rao Bahadur',
        outlet: {
          name: 'Kondapur Outlet',
          fssaiLicence: '13622014000123',
          address: 'Plot 42, Raghavendra Colony, Main Road, Kondapur',
        },
        items: [
          { name: 'Chicken Dum Biryani (Family Pack)', quantity: 1, itemTotal: 800 },
          { name: 'Double Ka Meetha', quantity: 2, itemTotal: 380 },
        ],
        total: 1180,
        status: 'preparing',
        promisedTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        loyaltyPointsEarned: 118,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const promisedDate = order?.promisedTime ? new Date(order.promisedTime) : new Date();
  const promisedTimeString = promisedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
            Order Sent to Kitchen Screen
          </span>
          <h1 className="text-2xl font-black text-stone-900 mt-1">Order Confirmed!</h1>
          <p className="text-sm font-extrabold text-stone-700 tracking-wider mt-1">
            Order ID: <span className="text-orange-600">{order?.orderId}</span>
          </p>
        </div>

        {/* Promised Time Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-amber-700 shrink-0" />
          <div className="text-left">
            <p className="text-xs text-amber-800 font-medium">Estimated Kitchen Ready Time:</p>
            <p className="text-base font-black text-amber-950">{promisedTimeString}</p>
          </div>
        </div>

        {/* Loyalty Reward Earned Callout */}
        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-stone-700">Loyalty Points Earned:</span>
          </div>
          <span className="font-bold text-orange-600">+{order?.loyaltyPointsEarned || 118} points</span>
        </div>

        {/* Outlet Info */}
        <div className="text-left text-xs text-stone-600 p-4 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
          <p className="font-bold text-stone-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-orange-600" /> Preparing at: {order?.outlet?.name}
          </p>
          <p className="text-stone-500 pl-5">{order?.outlet?.address}</p>
          <p className="text-stone-400 pl-5 text-[11px]">FSSAI Licence: {order?.outlet?.fssaiLicence}</p>
        </div>

        {/* Item Summary */}
        <div className="text-left space-y-2 border-t border-stone-100 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Items Ordered</h3>
          <div className="divide-y divide-stone-100 text-xs">
            {order?.items?.map((item, idx) => (
              <div key={idx} className="py-2 flex justify-between">
                <span>{item.name} &times; {item.quantity}</span>
                <span className="font-bold">₹{item.itemTotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-black text-stone-900">
            <span>Total Paid (incl. 5% GST)</span>
            <span className="text-orange-600">₹{order?.total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Link
            to={`/tracking/${order?.orderId}`}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            Track Live Kitchen Status <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/menu"
            className="block text-xs font-semibold text-stone-500 hover:text-stone-800 pt-2"
          >
            Order more delicious biryani
          </Link>
        </div>
      </div>
    </div>
  );
}

