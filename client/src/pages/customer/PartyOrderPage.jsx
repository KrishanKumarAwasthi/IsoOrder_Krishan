import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PhoneCall,
  UtensilsCrossed,
  ShieldCheck,
  Building2,
} from 'lucide-react';

import { API_BASE } from '../../config/api';

export default function PartyOrderPage() {
  const { selectedOutlet } = useCart();

  // Enforce minimum 24-hour notice
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    customerName: 'Rao Bahadur',
    customerPhone: '9876543210',
    customerEmail: 'customer@isoorder.com',
    outletId: selectedOutlet?._id || 'outlet_kondapur',
    eventDate: minDate,
    guestCount: 25,
    packageType: 'royal_biryani_celebration',
    specialRequests: 'Mild spice for kids, extra Double Ka Meetha and Biryani handis.',
  });

  const [loading, setLoading] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [error, setError] = useState(null);

  const calculateEstimate = () => {
    const perGuest = formData.packageType === 'nizami_feast' ? 850 : 600;
    return (parseInt(formData.guestCount) || 15) * perGuest;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/party-orders`, formData);
      setSuccessResponse(res.data.partyOrder);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit party order request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Direct Bulk & Party Catering (₹1.14 Cr Leakage Protection)
          </div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            Bulk & Party Orders
          </h1>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Authentic Hyderabadi Biryani handis & Nizam feasts delivered fresh in insulated hotboxes.
            Requires at least 24 hours advance notice and confirmation by our Catering Manager.
          </p>
        </div>

        {successResponse ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">
                Pending Catering Manager Confirmation
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">Request Submitted!</h2>
              <p className="text-sm font-extrabold text-stone-700 tracking-wider mt-1">
                Reference ID: <span className="text-orange-600">{successResponse.orderReference}</span>
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 text-xs text-stone-600 text-left space-y-2">
              <p><strong>Guests:</strong> {successResponse.guestCount} People</p>
              <p><strong>Event Time:</strong> {new Date(successResponse.eventDate).toLocaleString()}</p>
              <p><strong>Estimated Budget:</strong> ₹{successResponse.estimatedBudget}</p>
              <p><strong>Catering Kitchen:</strong> {selectedOutlet?.name || 'Kondapur'}</p>
            </div>

            <p className="text-xs text-stone-500">
              Our catering desk will contact {successResponse.customerPhone} within 2 hours to finalize handi logistics and menu customizations.
            </p>

            <Link
              to="/menu"
              className="inline-block py-2.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              Back to Menu
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Event Time (Minimum 24h notice enforced) */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Clock className="w-4 h-4 text-amber-700" />
                  <span>Notice Period Requirement</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  To ensure slow-cooked authentic dum pukht preparation, party orders require a minimum of 24 hours advance booking.
                </p>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Event Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    min={minDate}
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Guest Count & Package */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Number of Guests (Min: 15)
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Package Selection</label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="royal_biryani_celebration">
                      Royal Biryani Feast (₹600/guest)
                    </option>
                    <option value="nizami_feast">
                      Grand Nizami Feast + Haleem & Meetha (₹850/guest)
                    </option>
                  </select>
                </div>
              </div>

              {/* Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Host Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Customization & Dietary Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="e.g. Separate veg biryani handis, extra salan..."
                  className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Estimated Budget Callout */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500">Estimated Party Budget</span>
                  <p className="text-xl font-black text-stone-900">₹{calculateEstimate()}</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1" /> Includes 5% GST & Handi Packing
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Party Order for Manager Approval'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

