import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Gift,
  CreditCard,
  QrCode,
  ShieldCheck,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

import { API_BASE } from '../../config/api';

export default function CartPage() {
  const {
    selectedOutlet,
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    gst,
    appliedCoupon,
    setAppliedCoupon,
    couponDiscount,
    grandTotal,
    useLoyaltyPoints,
    setUseLoyaltyPoints,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'pickup'
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.addresses?.[0]?.addressLine || 'Flat 402, Royal Palms, Kondapur'
  );
  const [customerName, setCustomerName] = useState(user?.name || 'Rao Bahadur');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '9876543210');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'card'
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Loyalty calculations
  const availablePoints = user?.loyaltyPoints || 100;
  const canRedeemPoints = availablePoints >= 100;
  const loyaltyDiscount = useLoyaltyPoints && canRedeemPoints ? Math.min(Math.floor(availablePoints / 10), Math.floor(subtotal * 0.5)) : 0;
  const finalPayable = Math.max(0, grandTotal - loyaltyDiscount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponError('');
    try {
      const res = await axios.post(`${API_BASE}/coupons/validate`, {
        code: couponInput.trim(),
        subtotal,
      });
      setAppliedCoupon(res.data.coupon);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleOpenPayment = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setShowPaymentModal(true);
  };

  const handleConfirmPaymentAndOrder = async () => {
    setIsProcessingPayment(true);
    try {
      const payload = {
        outletId: selectedOutlet?._id || 'outlet_kondapur',
        items: cartItems.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          portion: i.portion,
          addOns: i.addOns,
        })),
        couponCode: appliedCoupon?.code || null,
        redeemLoyaltyPoints: useLoyaltyPoints,
        paymentMethod,
        customerName,
        customerPhone,
        deliveryAddress: {
          addressLine: deliveryType === 'delivery' ? deliveryAddress : 'Takeaway Pickup at Outlet',
          area: selectedOutlet?.name || 'Hyderabad',
        },
      };

      const res = await axios.post(`${API_BASE}/orders`, payload);
      const createdOrder = res.data.order;

      clearCart();
      setIsProcessingPayment(false);
      setShowPaymentModal(false);

      navigate(`/order-confirmation/${createdOrder.orderId}`);
    } catch (err) {
      setIsProcessingPayment(false);
      alert(err.response?.data?.error || 'Order placement failed. Please retry.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-stone-500 max-w-sm mb-6">
          Add authentic Hyderabadi biryani, haleem, or royal desserts from {selectedOutlet?.name || 'our menu'}.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-sm transition-colors"
        >
          Browse Menu <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-900">Review & Checkout</h1>
            <p className="text-xs text-stone-500">
              Ordering from <strong className="text-stone-900">{selectedOutlet?.name}</strong> (FSSAI: {selectedOutlet?.fssaiLicence})
            </p>
          </div>
          <Link to="/menu" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
            &larr; Add more items
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Cart Items & Delivery Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items List */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Your Ordered Items ({cartItems.length})
              </h2>

              <div className="divide-y divide-stone-100">
                {cartItems.map((item) => (
                  <div key={item.customKey} className="py-3 flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                        <h3 className="font-bold text-sm text-stone-900">{item.name}</h3>
                      </div>

                      {item.portion?.name && item.portion.name !== 'Standard' && (
                        <p className="text-xs text-stone-600 font-medium">Portion: {item.portion.name}</p>
                      )}

                      {item.addOns?.length > 0 && (
                        <p className="text-[11px] text-stone-500">
                          Extras: {item.addOns.map((a) => a.name).join(', ')}
                        </p>
                      )}

                      <div className="text-xs font-semibold text-stone-700 pt-0.5">
                        ₹{item.unitPrice} each &bull; <strong className="text-stone-900">₹{item.itemTotal}</strong>
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden shrink-0">
                      <button
                        onClick={() => updateQuantity(item.customKey, -1)}
                        className="p-1.5 text-stone-600 hover:bg-stone-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-stone-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.customKey, 1)}
                        className="p-1.5 text-stone-600 hover:bg-stone-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.customKey)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 shrink-0"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery / Takeaway Preferences */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">
                Delivery & Contact Info
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-colors ${
                    deliveryType === 'delivery'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Home Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-colors ${
                    deliveryType === 'pickup'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Takeaway / Outlet Pickup
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {deliveryType === 'delivery' && (
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House/Flat number, Street, Area"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Customer Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-600 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Billing, Coupons & Payment */}
          <div className="lg:col-span-5 space-y-6">
            {/* Promo Coupons */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-orange-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">Apply Coupon</h3>
              </div>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-emerald-800 tracking-wider">
                      {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-emerald-700">₹{couponDiscount} discount applied</p>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10, BIRYANI50"
                    className="flex-1 px-3 py-2 text-xs border rounded-lg uppercase tracking-wider font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && <p className="text-xs text-rose-600 font-medium">{couponError}</p>}

              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-stone-500">Available:</span>
                <button
                  type="button"
                  onClick={() => setCouponInput('WELCOME10')}
                  className="text-[10px] bg-stone-100 hover:bg-stone-200 font-bold px-2 py-0.5 rounded text-stone-700"
                >
                  WELCOME10 (10% off)
                </button>
                <button
                  type="button"
                  onClick={() => setCouponInput('BIRYANI50')}
                  className="text-[10px] bg-stone-100 hover:bg-stone-200 font-bold px-2 py-0.5 rounded text-stone-700"
                >
                  BIRYANI50 (₹50 off)
                </button>
              </div>
            </div>

            {/* Loyalty Rewards Redemption */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    IsoRewards ({availablePoints} pts)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  100 pts = ₹10
                </span>
              </div>

              <label className="flex items-center gap-2.5 pt-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!canRedeemPoints}
                  checked={useLoyaltyPoints}
                  onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <span className={canRedeemPoints ? 'text-stone-800 font-semibold' : 'text-stone-400'}>
                  Redeem reward points for ₹{Math.min(Math.floor(availablePoints / 10), Math.floor(subtotal * 0.5))} discount
                </span>
              </label>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Payment Method (Test Mode)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'upi'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs font-bold">UPI (GPay / PhonePe)</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-orange-600 bg-orange-50 text-orange-800'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-orange-600 focus:ring-orange-500"
                  />
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-bold">Credit / Debit Card</span>
                </label>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600">Bill Details</h3>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>Includes 5% GST (CGST 2.5% + SGST 2.5%)</span>
                  <span>₹{gst}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Loyalty Points Discount</span>
                    <span>-₹{loyaltyDiscount}</span>
                  </div>
                )}

                <div className="border-t border-stone-200 pt-3 flex justify-between items-center text-sm">
                  <span className="font-extrabold text-stone-900">To Pay</span>
                  <span className="text-xl font-black text-orange-600">₹{finalPayable}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenPayment}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Pay ₹{finalPayable}
              </button>

              <div className="pt-2 text-center text-[10px] text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Secure Checkout &bull; Test Mode
              </div>
            </div>
          </div>
        </div>

        {/* Mock Payment Simulation Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                {paymentMethod === 'upi' ? <QrCode className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-stone-900">
                  {paymentMethod === 'upi' ? 'Simulate UPI Payment' : 'Simulate Card Payment'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">Amount to pay: ₹{finalPayable}</p>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <p><strong>Merchant:</strong> Company A, Hyderabad</p>
                <p><strong>Outlet:</strong> {selectedOutlet?.name}</p>
                <p className="text-emerald-700 font-semibold">Test Gateway Simulation Active</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2.5 rounded-xl border text-xs font-bold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleConfirmPaymentAndOrder}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black shadow-sm disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Authorizing...' : 'Simulate Success'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

