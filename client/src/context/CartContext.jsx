import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [selectedOutlet, setSelectedOutlet] = useState(() => {
    const saved = localStorage.getItem('iso_outlet');
    return saved
      ? JSON.parse(saved)
      : {
          _id: '65f000000000000000000001',
          name: 'Kondapur Outlet',
          slug: 'kondapur',
          city: 'Hyderabad',
          address: 'Plot 42, Raghavendra Colony, Main Road, Kondapur',
          fssaiLicence: '13622014000123',
          minimumPrepTime: 25,
        };
  });

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('iso_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    const saved = localStorage.getItem('iso_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  useEffect(() => {
    if (selectedOutlet) {
      localStorage.setItem('iso_outlet', JSON.stringify(selectedOutlet));
    }
  }, [selectedOutlet]);

  useEffect(() => {
    const syncRealOutlet = async () => {
      try {
        const res = await axios.get(`${API_BASE}/outlets`);
        const liveOutlets = res.data?.data || [];
        if (liveOutlets.length > 0) {
          setSelectedOutlet((current) => {
            const isStaleId =
              !current ||
              !current._id ||
              String(current._id).startsWith('outlet_') ||
              !/^[0-9a-fA-F]{24}$/.test(String(current._id));
            if (isStaleId) {
              const matched = liveOutlets.find(
                (o) => o.slug === current?.slug || o.name === current?.name
              );
              return matched || liveOutlets[0];
            }
            // Even for valid IDs, verify the outlet still exists in the live list
            const stillValid = liveOutlets.find((o) => o._id === String(current._id));
            return stillValid || liveOutlets[0];
          });
        }
      } catch (err) {
        // Safe silent fallback — keep existing outlet
      }
    };
    syncRealOutlet();
  }, []);

  useEffect(() => {
    localStorage.setItem('iso_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('iso_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('iso_coupon');
    }
  }, [appliedCoupon]);

  // Set outlet with cart reset check
  const changeOutlet = (newOutlet) => {
    if (selectedOutlet && selectedOutlet._id !== newOutlet._id && cartItems.length > 0) {
      const confirmReset = window.confirm(
        'Changing outlets will clear items currently in your cart. Do you want to proceed?'
      );
      if (!confirmReset) return false;
      setCartItems([]);
      setAppliedCoupon(null);
    }
    setSelectedOutlet(newOutlet);
    return true;
  };

  // Add item with portion and addOns
  const addToCart = (item, portion = null, addOns = [], quantity = 1) => {
    const portionPrice = portion ? portion.price : 0;
    const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = (item.basePrice || 0) + portionPrice + addOnsTotal;

    // Unique key for this customization
    const portionKey = portion ? portion.name : 'standard';
    const addOnKey = addOns.map((a) => a.name).sort().join('|');
    const customKey = `${item._id}_${portionKey}_${addOnKey}`;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.customKey === customKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        updated[existingIdx].itemTotal = updated[existingIdx].quantity * unitPrice;
        return updated;
      }
      return [
        ...prev,
        {
          customKey,
          menuItemId: item._id,
          name: item.name,
          isVeg: item.isVeg,
          portion: portion || { name: 'Standard', price: 0 },
          addOns,
          unitPrice,
          quantity,
          itemTotal: unitPrice * quantity,
        },
      ];
    });
  };

  const updateQuantity = (customKey, delta) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.customKey === customKey) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              itemTotal: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeItem = (customKey) => {
    setCartItems((prev) => prev.filter((i) => i.customKey !== customKey));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setUseLoyaltyPoints(false);
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, i) => sum + i.itemTotal, 0);
  const totalItemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  // 5% GST included in menu price (Tax = Subtotal - Subtotal / 1.05)
  const gst = parseFloat(((subtotal * 5) / 105).toFixed(2));

  // Coupon discount
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.minOrderValue || 0)) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && couponDiscount > appliedCoupon.maxDiscountAmount) {
        couponDiscount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  // Grand total
  const grandTotal = Math.max(0, Math.round(subtotal - couponDiscount));

  return (
    <CartContext.Provider
      value={{
        selectedOutlet,
        changeOutlet,
        cartItems,
        totalItemCount,
        addToCart,
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

