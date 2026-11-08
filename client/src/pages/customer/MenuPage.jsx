import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import {
  Flame,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Info,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';

import { API_BASE } from '../../config/api';

// Fallback menu data for instant render and offline tests
const FALLBACK_MENU = [
  {
    category: {
      _id: 'cat_biryani',
      name: 'Dum Biryani Specials',
      slug: 'dum-biryani',
    },
    items: [
      {
        _id: 'item_ck_biryani',
        name: 'Chicken Dum Biryani',
        slug: 'chicken-dum-biryani',
        description: 'Authentic Hyderabadi Dum Biryani cooked with succulent spiced chicken, aged long-grain basmati, pure desi ghee, and saffron.',
        photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        basePrice: 380,
        isVeg: false,
        spiceLevel: 3,
        allergens: ['Dairy'],
        isAvailable: true,
        portions: [
          { name: 'Regular (Serves 1-2)', price: 0 },
          { name: 'Family Pack (Serves 3-4)', price: 420 },
        ],
        addOns: [
          { name: 'Extra Boiled Egg', price: 25 },
          { name: 'Extra Salan & Raita', price: 40 },
        ],
      },
      {
        _id: 'item_veg_biryani',
        name: 'Veg Dum Biryani',
        slug: 'veg-biryani',
        description: 'Layered basmati rice with freshly marinated cottage cheese, garden vegetables, and Nizam spices.',
        photo: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80',
        basePrice: 280,
        isVeg: true,
        spiceLevel: 2,
        allergens: ['Dairy'],
        isAvailable: true,
        portions: [
          { name: 'Regular', price: 0 },
          { name: 'Family Pack', price: 320 },
        ],
        addOns: [
          { name: 'Extra Fried Onions (Birista)', price: 30 },
          { name: 'Extra Paneer Cubes', price: 60 },
        ],
      },
    ],
  },
  {
    category: {
      _id: 'cat_starters',
      name: 'Starters & Curries',
      slug: 'starters',
    },
    items: [
      {
        _id: 'item_haleem',
        name: 'Mutton Haleem',
        slug: 'mutton-haleem',
        description: 'GI-tagged slow-cooked boneless tender mutton with cracked wheat, ghee, lentils, and royal spices.',
        photo: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
        basePrice: 350,
        isVeg: false,
        spiceLevel: 4,
        allergens: ['Wheat (Gluten)', 'Nuts', 'Dairy'],
        isAvailable: true,
        portions: [
          { name: 'Standard Bowl (350ml)', price: 0 },
          { name: 'Large Bowl (600ml)', price: 250 },
        ],
        addOns: [
          { name: 'Extra Pure Desi Ghee', price: 35 },
          { name: 'Roasted Cashews & Mint', price: 45 },
        ],
      },
      {
        _id: 'item_chicken_65',
        name: 'Chicken 65',
        slug: 'chicken-65',
        description: 'Bite-sized crispy spiced chicken tossed with fresh curry leaves, garlic, and fiery green chillies.',
        photo: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
        basePrice: 280,
        isVeg: false,
        spiceLevel: 4,
        allergens: ['Egg'],
        isAvailable: true,
      },
    ],
  },
  {
    category: {
      _id: 'cat_desserts',
      name: 'Desserts & Sweets',
      slug: 'desserts',
    },
    items: [
      {
        _id: 'item_meetha',
        name: 'Double Ka Meetha',
        slug: 'double-ka-meetha',
        description: 'Golden fried bread pudding soaked in thick cardamom rabri, saffron, and sliced almonds.',
        photo: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
        basePrice: 190,
        isVeg: true,
        spiceLevel: 1,
        allergens: ['Gluten', 'Dairy', 'Nuts'],
        isAvailable: true,
      },
    ],
  },
];

export default function MenuPage() {
  const { selectedOutlet, addToCart, cartItems, totalItemCount, subtotal } = useCart();
  const [menu, setMenu] = useState(FALLBACK_MENU);
  const [activeCategory, setActiveCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [suggestions, setSuggestions] = useState([
    {
      _id: 'sugg_1',
      name: 'Chicken Dum Biryani (Family Pack)',
      description: 'Your frequently ordered Hyderabadi special with extra salan.',
      basePrice: 800,
      photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      isVeg: false,
      spiceLevel: 3,
      isAvailable: true,
    },
    {
      _id: 'sugg_2',
      name: 'Double Ka Meetha',
      description: 'Your favorite Nizami dessert with rabri and pistachios.',
      basePrice: 190,
      photo: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
      isVeg: true,
      spiceLevel: 1,
      isAvailable: true,
    },
  ]);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedOutlet?._id) {
      fetchMenu(selectedOutlet._id);
    }
  }, [selectedOutlet]);

  const fetchMenu = async (outletId) => {
    try {
      const res = await axios.get(`${API_BASE}/menu/outlet/${outletId}`);
      if (res.data?.menu && res.data.menu.length > 0) {
        setMenu(res.data.menu);
        setActiveCategory(res.data.menu[0].category._id);
      }
    } catch (e) {
      // Use fallback menu
    }
  };

  const handleOpenCustomization = (item) => {
    if (!item.isAvailable) return;
    setSelectedItemForModal(item);
    setSelectedPortion(item.portions && item.portions.length > 0 ? item.portions[0] : null);
    setSelectedAddOns([]);
    setQuantity(1);
  };

  const handleToggleAddOn = (addon) => {
    setSelectedAddOns((prev) => {
      const exists = prev.find((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      }
      return [...prev, addon];
    });
  };

  const handleConfirmAddToCart = () => {
    if (selectedItemForModal) {
      addToCart(selectedItemForModal, selectedPortion, selectedAddOns, quantity);
      setSelectedItemForModal(null);
    }
  };

  const calculateModalPrice = () => {
    if (!selectedItemForModal) return 0;
    const base = selectedItemForModal.basePrice || 0;
    const portionExtra = selectedPortion ? selectedPortion.price : 0;
    const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    return (base + portionExtra + addOnsTotal) * quantity;
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Outlet Banner & FSSAI / GST notice */}
      <div className="bg-white border-b border-stone-200 sticky top-14 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-stone-900 text-base">{selectedOutlet?.name || 'Kondapur Outlet'}</h2>
                <Link
                  to="/outlets"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline"
                >
                  Change
                </Link>
              </div>
              <p className="text-xs text-stone-500">{selectedOutlet?.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> FSSAI: {selectedOutlet?.fssaiLicence || '13622014000123'}
            </span>
            <span className="text-stone-500 font-medium">Prices include 5% GST</span>
          </div>
        </div>

        {/* Category Horizontal Filter Bar & Veg Switch */}
        <div className="border-t border-stone-100 max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Items
            </button>
            {menu.map((group) => (
              <button
                key={group.category._id}
                onClick={() => setActiveCategory(group.category._id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === group.category._id
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {group.category.name}
              </button>
            ))}
          </div>

          {/* Veg Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer shrink-0 ml-auto">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border border-emerald-600 flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </span>
              Veg Only
            </span>
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4"
            />
          </label>
        </div>
      </div>

      {/* Main Menu Grid */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* AI Smart Reorder Suggestions (Display Only - Never Auto-Added) */}
        {suggestions.length > 0 && !vegOnly && activeCategory === 'all' && (
          <section className="p-5 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-600 text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-sm">
                    AI Reorder Suggestions (From Your History)
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Smart recommendations based on previous orders &bull; Click to view details
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                Display Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {suggestions.map((sugg) => (
                <div
                  key={sugg._id}
                  onClick={() => handleOpenCustomization(sugg)}
                  className="bg-white p-3 rounded-2xl border border-stone-200 hover:border-orange-400 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sugg.photo}
                      alt={sugg.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{sugg.name}</h4>
                      <p className="text-[10px] text-stone-500 line-clamp-1">{sugg.description}</p>
                      <span className="text-xs font-black text-orange-600">₹{sugg.basePrice}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCustomization(sugg);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-colors"
                  >
                    View & Customize
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        {menu.map((group) => {
          if (activeCategory !== 'all' && activeCategory !== group.category._id) return null;

          const itemsToDisplay = vegOnly ? group.items.filter((i) => i.isVeg) : group.items;

          if (itemsToDisplay.length === 0) {
            return (
              <div key={group.category._id} className="text-center py-12 text-stone-500 text-sm">
                No items match your filter in this category.
              </div>
            );
          }

          return (
            <section key={group.category._id}>
              <h3 className="text-xl font-extrabold text-stone-900 mb-4">{group.category.name}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {itemsToDisplay.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-white rounded-2xl border p-4 flex gap-4 transition-all ${
                      item.isAvailable
                        ? 'border-stone-200 hover:border-orange-300 hover:shadow-sm'
                        : 'border-stone-200 opacity-60 bg-stone-50'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {/* Veg / Non-Veg badge */}
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-sm">
                        <span
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-stone-900 text-base leading-snug">{item.name}</h4>
                          <span className="font-black text-stone-900 text-base shrink-0">₹{item.basePrice}</span>
                        </div>

                        <p className="text-xs text-stone-500 line-clamp-2 mt-1">{item.description}</p>

                        {/* Spice Level & Allergens */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="inline-flex items-center text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                            <Flame className="w-3 h-3 text-orange-600 mr-0.5" /> Spice {item.spiceLevel}/5
                          </span>
                          {item.allergens && item.allergens.length > 0 && (
                            <span className="text-[10px] text-stone-500">
                              Contains: {item.allergens.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <div className="pt-3 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400">
                          {item.portions?.length > 1 ? 'Portions available' : 'Single standard'}
                        </span>

                        {item.isAvailable ? (
                          <button
                            onClick={() => handleOpenCustomization(item)}
                            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            Add <Plus className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Item Customization Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                      selectedItemForModal.isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        selectedItemForModal.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </span>
                  <h3 className="font-extrabold text-xl text-stone-900">{selectedItemForModal.name}</h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">Select portions and accompaniments</p>
              </div>
              <button
                onClick={() => setSelectedItemForModal(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Portions */}
            {selectedItemForModal.portions && selectedItemForModal.portions.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Choose Portion Size
                </label>
                <div className="space-y-2">
                  {selectedItemForModal.portions.map((portion) => (
                    <label
                      key={portion.name}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedPortion?.name === portion.name
                          ? 'border-orange-500 bg-orange-50/50'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="portion"
                          checked={selectedPortion?.name === portion.name}
                          onChange={() => setSelectedPortion(portion)}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm font-semibold text-stone-900">{portion.name}</span>
                      </div>
                      <span className="text-xs font-bold text-stone-700">
                        {portion.price > 0 ? `+₹${portion.price}` : 'Base Price'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {selectedItemForModal.addOns && selectedItemForModal.addOns.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Add Accompaniments / Extras
                </label>
                <div className="space-y-2">
                  {selectedItemForModal.addOns.map((addon) => {
                    const isChecked = !!selectedAddOns.find((a) => a.name === addon.name);
                    return (
                      <label
                        key={addon.name}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                          isChecked ? 'border-orange-500 bg-orange-50/50' : 'border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAddOn(addon)}
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-medium text-stone-900">{addon.name}</span>
                        </div>
                        <span className="text-xs font-bold text-stone-700">+₹{addon.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Add Button */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-100">
              <div className="flex items-center border border-stone-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-stone-600 hover:bg-stone-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-2 text-stone-600 hover:bg-stone-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleConfirmAddToCart}
                className="py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Add Item • ₹{calculateModalPrice()}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <Link
            to="/cart"
            className="flex items-center justify-between bg-stone-900 hover:bg-stone-800 text-white p-4 rounded-2xl shadow-xl transition-all border border-stone-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-xs">
                {totalItemCount}
              </div>
              <div>
                <p className="text-xs text-stone-400">Total (incl. 5% GST)</p>
                <p className="text-base font-extrabold text-white">₹{subtotal}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-orange-400 font-bold text-sm">
              <span>View Cart & Checkout</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

