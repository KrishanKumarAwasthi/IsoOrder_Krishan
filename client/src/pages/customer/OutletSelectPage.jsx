import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { MapPin, Navigation, Clock, ShieldCheck, ChevronRight, Store, Flame } from 'lucide-react';

import { API_BASE } from '../../config/api';

// Fallback initial outlets in case backend is loading
const FALLBACK_OUTLETS = [
  {
    _id: 'outlet_kondapur',
    name: 'Kondapur Outlet',
    slug: 'kondapur',
    type: 'retail',
    city: 'Hyderabad',
    address: 'Plot 42, Raghavendra Colony, Main Road, Kondapur, Hyderabad',
    deliveryRadiusKm: 8,
    fssaiLicence: '13622014000123',
    minimumPrepTime: 25,
    distanceKm: 1.2,
    isDeliverable: true,
  },
  {
    _id: 'outlet_gachibowli',
    name: 'Gachibowli Cloud Kitchen',
    slug: 'gachibowli-cloud-kitchen',
    type: 'cloud_kitchen',
    city: 'Hyderabad',
    address: 'Siddhi Vinayak Nagar, Near Financial District, Gachibowli, Hyderabad',
    deliveryRadiusKm: 9,
    fssaiLicence: '13622014000124',
    minimumPrepTime: 20,
    distanceKm: 3.5,
    isDeliverable: true,
  },
  {
    _id: 'outlet_kukatpally',
    name: 'Kukatpally Outlet',
    slug: 'kukatpally',
    type: 'retail',
    city: 'Hyderabad',
    address: 'Phase 3, KPHB Colony, Near Forum Mall, Kukatpally, Hyderabad',
    deliveryRadiusKm: 8,
    fssaiLicence: '13622014000125',
    minimumPrepTime: 30,
    distanceKm: 5.1,
    isDeliverable: true,
  },
  {
    _id: 'outlet_jubilee_hills',
    name: 'Jubilee Hills Outlet',
    slug: 'jubilee-hills',
    type: 'retail',
    city: 'Hyderabad',
    address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills, Hyderabad',
    deliveryRadiusKm: 10,
    fssaiLicence: '13622014000126',
    minimumPrepTime: 25,
    distanceKm: 6.8,
    isDeliverable: true,
  },
  {
    _id: 'outlet_madhapur',
    name: 'Madhapur Outlet',
    slug: 'madhapur',
    type: 'retail',
    city: 'Hyderabad',
    address: '100 Feet Road, Near Ayyappa Society, Madhapur, Hyderabad',
    deliveryRadiusKm: 7,
    fssaiLicence: '13622014000127',
    minimumPrepTime: 25,
    distanceKm: 4.2,
    isDeliverable: true,
  },
];

export default function OutletSelectPage() {
  const [outlets, setOutlets] = useState(FALLBACK_OUTLETS);
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedOutlet, changeOutlet } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutlets();
  }, []);

  const fetchOutlets = async () => {
    try {
      const res = await axios.get(`${API_BASE}/outlets`);
      if (res.data?.data && res.data.data.length > 0) {
        setOutlets(res.data.data);
      }
    } catch (err) {
      // Use fallback outlets on initial load
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await axios.get(`${API_BASE}/outlets/nearby?lat=${latitude}&lng=${longitude}`);
          if (res.data?.data && res.data.data.length > 0) {
            setOutlets(res.data.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        alert('Could not detect location. Please select your nearest outlet below.');
      }
    );
  };

  const handleSelectOutlet = (outlet) => {
    changeOutlet(outlet);
    navigate('/menu');
  };

  const filtered = outlets
    .filter((o) => {
      if (filterType === 'retail') return o.type === 'retail';
      if (filterType === 'cloud_kitchen') return o.type === 'cloud_kitchen';
      return true;
    })
    .filter((o) => o.name.toLowerCase().includes(searchQuery.toLowerCase()) || o.address.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold mb-3">
            <Store className="w-3.5 h-3.5" /> 14 Outlets & 3 Cloud Kitchens Across Hyderabad
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Choose Your Outlet</h1>
          <p className="mt-1 text-sm text-stone-500">
            Orders are routed directly to your nearest outlet's kitchen screen for fastest preparation.
          </p>
        </div>

        {/* Location Detection Bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900">Deliver within your area</p>
              <p className="text-xs text-stone-500">Auto-detect nearest kitchen within delivery radius</p>
            </div>
          </div>
          <button
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 shrink-0"
          >
            <Navigation className="w-4 h-4" />
            {detectingLocation ? 'Locating...' : 'Find Nearest Outlet'}
          </button>
        </div>

        {/* Search & Type Filter Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search outlet by area or landmark..."
            className="w-full sm:w-72 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('retail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'retail'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Retail Outlets
            </button>
            <button
              onClick={() => setFilterType('cloud_kitchen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'cloud_kitchen'
                  ? 'bg-stone-900 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Cloud Kitchens
            </button>
          </div>
        </div>

        {/* Outlets List */}
        <div className="space-y-3">
          {filtered.map((outlet) => {
            const isSelected = selectedOutlet?._id === outlet._id;
            return (
              <div
                key={outlet._id}
                onClick={() => handleSelectOutlet(outlet)}
                className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-100 shadow-sm'
                    : 'border-stone-200 hover:border-orange-300 hover:shadow-sm'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-stone-900 text-base">{outlet.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        outlet.type === 'cloud_kitchen'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {outlet.type === 'cloud_kitchen' ? 'Cloud Kitchen' : 'Retail Outlet'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        Current Outlet
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-1">{outlet.address}</p>

                  <div className="flex items-center gap-4 text-xs text-stone-600 pt-1">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> ~{outlet.minimumPrepTime || 25} mins prep
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-stone-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> FSSAI: {outlet.fssaiLicence}
                    </span>
                    {outlet.distanceKm !== undefined && (
                      <span className="font-semibold text-orange-600">{outlet.distanceKm} km away</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors"
                  >
                    Select & Order <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

