import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { SOCKET_EVENTS, ORDER_STATUS } from '../../shared/constants.js';
import {
  ChefHat,
  Clock,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Building2,
  Package,
  Bike,
  Sparkles,
  Flame,
} from 'lucide-react';

import { API_BASE } from '../../config/api';

// Realistic sample orders from the brief for instant KDS render & fallback
const FALLBACK_KITCHEN_ORDERS = [
  {
    _id: 'order_1',
    orderId: 'WEB-778120',
    outlet: { _id: 'outlet_kondapur', name: 'Kondapur' },
    customerName: 'Rao Bahadur',
    customerPhone: '9876543210',
    status: ORDER_STATUS.PREPARING,
    placedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    promisedTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    isLate: false,
    minutesLate: 0,
    items: [
      {
        name: 'Chicken dum biryani',
        quantity: 1,
        portion: { name: 'family pack', price: 420 },
        addOns: [],
      },
      {
        name: 'Double ka meetha',
        quantity: 2,
        portion: { name: 'Standard', price: 0 },
        addOns: [],
      },
    ],
  },
  {
    _id: 'order_2',
    orderId: 'WEB-778131',
    outlet: { _id: 'outlet_kondapur', name: 'Kondapur' },
    customerName: 'Ananya Sharma',
    customerPhone: '9876543211',
    status: ORDER_STATUS.READY,
    placedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    promisedTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    isLate: false,
    minutesLate: 0,
    items: [
      {
        name: 'Veg biryani',
        quantity: 2,
        portion: { name: 'Regular', price: 0 },
        addOns: [],
      },
      {
        name: 'Mirchi ka salan',
        quantity: 1,
        portion: { name: 'Standard', price: 0 },
        addOns: [],
      },
    ],
  },
  {
    _id: 'order_3',
    orderId: 'WEB-778146',
    outlet: { _id: 'outlet_kondapur', name: 'Kondapur' },
    customerName: 'Vikram Reddy',
    customerPhone: '9876543212',
    status: ORDER_STATUS.PREPARING,
    placedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    promisedTime: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // Late by 4 minutes!
    isLate: true,
    minutesLate: 4,
    items: [
      {
        name: 'Mutton haleem',
        quantity: 3,
        portion: { name: 'Standard Bowl (350ml)', price: 0 },
        addOns: [],
      },
    ],
  },
];

export default function KitchenDisplayPage() {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [selectedOutletId, setSelectedOutletId] = useState(
    user?.assignedOutlet?._id || user?.assignedOutlet || 'outlet_kondapur'
  );
  const [outlets, setOutlets] = useState([
    { _id: 'outlet_kondapur', name: 'Kondapur Outlet' },
    { _id: 'outlet_gachibowli', name: 'Gachibowli Cloud Kitchen' },
    { _id: 'outlet_kukatpally', name: 'Kukatpally Outlet' },
  ]);

  const [orders, setOrders] = useState(FALLBACK_KITCHEN_ORDERS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Web Audio chime generator
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Audio not permitted or user hasn't interacted
    }
  };

  // Clock tick every 10 seconds for dynamic countdowns
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial active orders for selected outlet
  useEffect(() => {
    fetchKitchenOrders(selectedOutletId);
  }, [selectedOutletId]);

  const fetchKitchenOrders = async (outletId) => {
    try {
      const res = await axios.get(`${API_BASE}/kitchen/orders?outletId=${outletId}`);
      if (res.data?.orders && res.data.orders.length > 0) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      // Fallback orders stay in place
    }
  };

  // Socket.IO real-time listener
  useEffect(() => {
    if (!socket || !selectedOutletId) return;

    // Join outlet room
    socket.emit(SOCKET_EVENTS.KITCHEN_JOIN, { outletId: selectedOutletId });

    const handleNewOrder = (newOrder) => {
      console.log('[KDS] New order arrived:', newOrder.orderId);
      playChime();
      setOrders((prev) => [newOrder, ...prev]);
    };

    const handleStatusUpdate = (update) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === update.orderId ? { ...o, ...update } : o))
      );
    };

    const handleOverride = (update) => {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === update.orderId ? { ...o, ...update } : o))
      );
    };

    socket.on(SOCKET_EVENTS.ORDER_NEW, handleNewOrder);
    socket.on(SOCKET_EVENTS.ORDER_STATUS_UPDATE, handleStatusUpdate);
    socket.on(SOCKET_EVENTS.ORDER_ESTIMATE_OVERRIDE, handleOverride);

    return () => {
      socket.off(SOCKET_EVENTS.ORDER_NEW, handleNewOrder);
      socket.off(SOCKET_EVENTS.ORDER_STATUS_UPDATE, handleStatusUpdate);
      socket.off(SOCKET_EVENTS.ORDER_ESTIMATE_OVERRIDE, handleOverride);
    };
  }, [socket, selectedOutletId, soundEnabled]);

  // Stage transition handler
  const handleAdvanceStatus = async (order, nextStatus) => {
    try {
      await axios.put(`${API_BASE}/kitchen/orders/${order._id}/status`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status: nextStatus } : o))
      );
    } catch (err) {
      // Optimistic update for offline demo
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, status: nextStatus } : o))
      );
    }
  };

  // Group orders into KDS stages
  const newOrders = orders.filter((o) => o.status === ORDER_STATUS.PLACED || o.status === ORDER_STATUS.CONFIRMED);
  const preparingOrders = orders.filter((o) => o.status === ORDER_STATUS.PREPARING);
  const readyOrders = orders.filter((o) => o.status === ORDER_STATUS.READY);
  const handedOffOrders = orders.filter((o) => o.status === ORDER_STATUS.PICKED_UP);

  const getLatenessInfo = (order) => {
    const promised = new Date(order.promisedTime);
    const diffMs = currentTime.getTime() - promised.getTime();
    const isLate = diffMs > 0;
    const minutesLate = isLate ? Math.floor(diffMs / 60000) : 0;
    const minutesRemaining = !isLate ? Math.floor(-diffMs / 60000) : 0;
    const isImminent = !isLate && minutesRemaining <= 5;

    return { isLate, minutesLate, minutesRemaining, isImminent };
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans select-none">
      {/* Top Tablet Navigation Bar (High contrast for kitchen distance reading) */}
      <header className="bg-stone-950 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-lg">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              KITCHEN DISPLAY SYSTEM (KDS)
              <span className="text-xs font-bold text-orange-500 bg-orange-950 px-2.5 py-0.5 rounded-full border border-orange-800">
                LIVE
              </span>
            </h1>
            <p className="text-xs text-stone-400">
              High-contrast station screen &bull; Readable from 2 metres
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Outlet Switcher */}
          <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
            <Building2 className="w-4 h-4 text-stone-400" />
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-200 focus:outline-none cursor-pointer"
            >
              {outlets.map((o) => (
                <option key={o._id} value={o._id} className="bg-stone-900 text-white">
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-stone-900 border-stone-700 text-orange-400'
                : 'bg-stone-900 border-stone-800 text-stone-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {/* Connection Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
              isConnected ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </div>
        </div>
      </header>

      {/* Main 4-Column Workflow Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto">
        {/* Stage 1: New Incoming Orders */}
        <div className="flex flex-col rounded-2xl bg-stone-950/80 border border-stone-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <h2 className="font-black text-sm tracking-wider uppercase text-stone-200">
                1. New Orders ({newOrders.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-stone-400">Incoming</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {newOrders.map((order) => (
              <OrderCard
                key={order._id || order.orderId}
                order={order}
                lateness={getLatenessInfo(order)}
                actionLabel="Accept & Start Prep &rarr;"
                actionClass="bg-blue-600 hover:bg-blue-500 text-white"
                onAdvance={() => handleAdvanceStatus(order, ORDER_STATUS.PREPARING)}
              />
            ))}
            {newOrders.length === 0 && (
              <div className="text-center py-12 text-stone-600 text-xs font-medium">
                No new incoming tickets
              </div>
            )}
          </div>
        </div>

        {/* Stage 2: Preparing in Kitchen */}
        <div className="flex flex-col rounded-2xl bg-stone-950/80 border border-stone-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="font-black text-sm tracking-wider uppercase text-stone-200">
                2. In Prep ({preparingOrders.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-orange-400">Cooking</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {preparingOrders.map((order) => (
              <OrderCard
                key={order._id || order.orderId}
                order={order}
                lateness={getLatenessInfo(order)}
                actionLabel="Mark Ready for Pickup &rarr;"
                actionClass="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black"
                onAdvance={() => handleAdvanceStatus(order, ORDER_STATUS.READY)}
              />
            ))}
            {preparingOrders.length === 0 && (
              <div className="text-center py-12 text-stone-600 text-xs font-medium">
                No orders currently in prep
              </div>
            )}
          </div>
        </div>

        {/* Stage 3: Ready for Pickup */}
        <div className="flex flex-col rounded-2xl bg-stone-950/80 border border-stone-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h2 className="font-black text-sm tracking-wider uppercase text-stone-200">
                3. Ready for Pickup ({readyOrders.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-emerald-400">Packed</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {readyOrders.map((order) => (
              <OrderCard
                key={order._id || order.orderId}
                order={order}
                lateness={getLatenessInfo(order)}
                actionLabel="Hand Off to Rider &rarr;"
                actionClass="bg-emerald-600 hover:bg-emerald-500 text-white font-black"
                onAdvance={() => handleAdvanceStatus(order, ORDER_STATUS.PICKED_UP)}
              />
            ))}
            {readyOrders.length === 0 && (
              <div className="text-center py-12 text-stone-600 text-xs font-medium">
                No orders waiting for pickup
              </div>
            )}
          </div>
        </div>

        {/* Stage 4: Handed Off / Out with Rider */}
        <div className="flex flex-col rounded-2xl bg-stone-950/80 border border-stone-800 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-purple-400" />
              <h2 className="font-black text-sm tracking-wider uppercase text-stone-200">
                4. Handed Off ({handedOffOrders.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-purple-400">En Route</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {handedOffOrders.map((order) => (
              <OrderCard
                key={order._id || order.orderId}
                order={order}
                lateness={getLatenessInfo(order)}
                actionLabel="Completed"
                actionClass="bg-stone-800 text-stone-500 cursor-not-allowed"
                disabled={true}
              />
            ))}
            {handedOffOrders.length === 0 && (
              <div className="text-center py-12 text-stone-600 text-xs font-medium">
                No recent handoffs
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable High-Contrast Tablet Card Component
function OrderCard({ order, lateness, actionLabel, actionClass, onAdvance, disabled }) {
  const { isLate, minutesLate, minutesRemaining, isImminent } = lateness;

  // Lateness Card Border & Header Styling (Readable from 2m)
  let cardBorderClass = 'border-stone-800 bg-stone-900';
  let badgeClass = 'bg-stone-800 text-stone-300';
  let timerText = `${minutesRemaining}m left`;

  if (isLate) {
    cardBorderClass = 'border-rose-600 ring-2 ring-rose-500/50 bg-rose-950/20';
    badgeClass = 'bg-rose-600 text-white animate-pulse font-black';
    timerText = `LATE BY ${minutesLate} MINS`;
  } else if (isImminent) {
    cardBorderClass = 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-950/20';
    badgeClass = 'bg-amber-500 text-stone-950 font-black';
    timerText = `URGENT (${minutesRemaining}m left)`;
  }

  const promisedDate = new Date(order.promisedTime);
  const promisedTimeString = promisedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`p-4 rounded-2xl border transition-all shadow-md space-y-3 ${cardBorderClass}`}>
      {/* Top Order ID and Big Timer Badge */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <span className="text-xl font-black text-white tracking-wider block">
            {order.orderId}
          </span>
          <span className="text-[11px] text-stone-400 font-semibold">
            {order.customerName}
          </span>
        </div>

        <div className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${badgeClass}`}>
          {timerText}
        </div>
      </div>

      {/* Promised Time Notice */}
      <div className="flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-800/80 pt-2">
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-stone-500" /> Target: {promisedTimeString}
        </span>
        <span className="font-bold text-stone-300 uppercase">{order.paymentMethod || 'UPI'} Paid</span>
      </div>

      {/* Items list with quantities and portions */}
      <div className="space-y-1.5 py-1 text-sm">
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-2 border-b border-stone-800/40 pb-1">
            <span className="font-extrabold text-white leading-tight">
              <span className="text-orange-400 font-black text-base mr-1.5">{item.quantity}&times;</span>
              {item.name}
              {item.portion?.name && item.portion.name !== 'Standard' && (
                <span className="block text-xs font-semibold text-stone-400">
                  [{item.portion.name}]
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Advance Action Button */}
      {actionLabel && (
        <button
          type="button"
          disabled={disabled}
          onClick={onAdvance}
          className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${actionClass}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

