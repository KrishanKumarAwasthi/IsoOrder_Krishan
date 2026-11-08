import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.model.js';
import { Outlet } from '../models/Outlet.model.js';
import { Category } from '../models/Category.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Coupon } from '../models/Coupon.model.js';
import { Order } from '../models/Order.model.js';
import { ROLES, OUTLET_TYPES, ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, TIME_SLOTS } from '../shared/constants.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Outlet.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Coupon.deleteMany({}),
      Order.deleteMany({}),
    ]);

    // 1. Seed Outlets
    console.log('[Seed] Seeding Outlets...');
    const outletsData = [
      {
        name: 'Kondapur Outlet',
        slug: 'kondapur',
        type: OUTLET_TYPES.RETAIL,
        city: 'Hyderabad',
        address: 'Plot 42, Raghavendra Colony, Main Road, Kondapur, Hyderabad',
        location: {
          type: 'Point',
          coordinates: [78.3578, 17.4699], // [lng, lat]
        },
        deliveryRadiusKm: 8,
        fssaiLicence: '13622014000123',
        phone: '+91 40 2311 0001',
        minimumPrepTime: 25,
      },
      {
        name: 'Gachibowli Cloud Kitchen',
        slug: 'gachibowli-cloud-kitchen',
        type: OUTLET_TYPES.CLOUD_KITCHEN,
        city: 'Hyderabad',
        address: 'Siddhi Vinayak Nagar, Near Financial District, Gachibowli, Hyderabad',
        location: {
          type: 'Point',
          coordinates: [78.3489, 17.4401],
        },
        deliveryRadiusKm: 9,
        fssaiLicence: '13622014000124',
        phone: '+91 40 2311 0002',
        minimumPrepTime: 20,
      },
      {
        name: 'Kukatpally Outlet',
        slug: 'kukatpally',
        type: OUTLET_TYPES.RETAIL,
        city: 'Hyderabad',
        address: 'Phase 3, KPHB Colony, Near Forum Mall, Kukatpally, Hyderabad',
        location: {
          type: 'Point',
          coordinates: [78.3995, 17.4934],
        },
        deliveryRadiusKm: 8,
        fssaiLicence: '13622014000125',
        phone: '+91 40 2311 0003',
        minimumPrepTime: 30,
      },
      {
        name: 'Jubilee Hills Outlet',
        slug: 'jubilee-hills',
        type: OUTLET_TYPES.RETAIL,
        city: 'Hyderabad',
        address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills, Hyderabad',
        location: {
          type: 'Point',
          coordinates: [78.4073, 17.4319],
        },
        deliveryRadiusKm: 10,
        fssaiLicence: '13622014000126',
        phone: '+91 40 2311 0004',
        minimumPrepTime: 25,
      },
      {
        name: 'Madhapur Outlet',
        slug: 'madhapur',
        type: OUTLET_TYPES.RETAIL,
        city: 'Hyderabad',
        address: '100 Feet Road, Near Ayyappa Society, Madhapur, Hyderabad',
        location: {
          type: 'Point',
          coordinates: [78.3908, 17.4483],
        },
        deliveryRadiusKm: 7,
        fssaiLicence: '13622014000127',
        phone: '+91 40 2311 0005',
        minimumPrepTime: 25,
      },
    ];

    const outlets = await Outlet.insertMany(outletsData);
    const outletMap = {};
    outlets.forEach((o) => {
      outletMap[o.slug] = o;
    });

    // 2. Seed Users
    console.log('[Seed] Seeding Users with hashed passwords...');
    const usersData = [
      {
        name: 'Rao Bahadur',
        email: 'customer@isoorder.com',
        phone: '9876543210',
        password: 'customer123',
        role: ROLES.CUSTOMER,
        loyaltyPoints: 250,
        marketingOptIn: true,
        addresses: [
          {
            tag: 'Home',
            addressLine: 'Flat 402, Royal Palms, Kondapur',
            area: 'Kondapur',
            city: 'Hyderabad',
            pincode: '500084',
            coordinates: [78.361, 17.468],
          },
        ],
      },
      {
        name: 'Ananya Sharma',
        email: 'hyderabad.foodie@isoorder.com',
        phone: '9876543211',
        password: 'customer123',
        role: ROLES.CUSTOMER,
        loyaltyPoints: 180,
        marketingOptIn: true,
      },
      {
        name: 'Vikram Reddy',
        email: 'biryani.lover@isoorder.com',
        phone: '9876543212',
        password: 'customer123',
        role: ROLES.CUSTOMER,
        loyaltyPoints: 100,
        marketingOptIn: false,
      },
      {
        name: 'Kondapur Head Chef',
        email: 'kitchen.kondapur@isoorder.com',
        phone: '9876543220',
        password: 'kitchen123',
        role: ROLES.KITCHEN,
        assignedOutlet: outletMap['kondapur']._id,
      },
      {
        name: 'Gachibowli Cloud Chef',
        email: 'kitchen.gachibowli@isoorder.com',
        phone: '9876543221',
        password: 'kitchen123',
        role: ROLES.KITCHEN,
        assignedOutlet: outletMap['gachibowli-cloud-kitchen']._id,
      },
      {
        name: 'Central Operations Admin',
        email: 'admin@isoorder.com',
        phone: '9876543299',
        password: 'admin123',
        role: ROLES.ADMIN,
      },
    ];

    // Create users individually to trigger password hashing pre-save hook
    const users = [];
    for (const u of usersData) {
      const created = await User.create(u);
      users.push(created);
    }
    const customer = users[0];

    // 3. Seed Categories
    console.log('[Seed] Seeding Categories...');
    const categoriesData = [
      {
        name: 'Dum Biryani',
        slug: 'dum-biryani',
        description: 'Authentic slow-cooked kacchi dum biryani layered with fragrant basmati and spices',
        displayOrder: 1,
        timeSlots: [TIME_SLOTS.ALL, TIME_SLOTS.LUNCH, TIME_SLOTS.DINNER],
      },
      {
        name: 'Starters & Kebabs',
        slug: 'starters-kebabs',
        description: 'Crispy, smoky, spiced Hyderabadi appetisers and kebabs',
        displayOrder: 2,
        timeSlots: [TIME_SLOTS.ALL],
      },
      {
        name: 'Haleem & Curries',
        slug: 'haleem-curries',
        description: 'Rich, slow-cooked meat delicacies, salans, and traditional accompaniments',
        displayOrder: 3,
        timeSlots: [TIME_SLOTS.ALL, TIME_SLOTS.DINNER],
      },
      {
        name: 'Desserts & Sweets',
        slug: 'desserts-sweets',
        description: 'Royal Nizami sweet dishes prepared with pure ghee and dry fruits',
        displayOrder: 4,
        timeSlots: [TIME_SLOTS.ALL],
      },
    ];
    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => {
      catMap[c.slug] = c._id;
    });

    // 4. Seed Menu Items
    console.log('[Seed] Seeding Menu Items...');
    const menuItemsData = [
      {
        name: 'Chicken Dum Biryani',
        slug: 'chicken-dum-biryani',
        description: 'World-famous authentic Hyderabadi Dum Biryani cooked with succulent chicken pieces, long-grain basmati, saffron, and aromatic spices. Served with Mirchi Ka Salan and Raita.',
        photo: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
        category: catMap['dum-biryani'],
        basePrice: 380,
        priceByCity: { Hyderabad: 380, Bangalore: 420 },
        isVeg: false,
        spiceLevel: 3,
        allergens: ['Dairy'],
        portions: [
          { name: 'Regular (Serves 1-2)', price: 0 },
          { name: 'Family Pack (Serves 3-4)', price: 420 }, // 380 + 420 = 800
          { name: 'Jumbo Pack (Serves 5-6)', price: 800 },
        ],
        addOns: [
          { name: 'Extra Boiled Egg', price: 25 },
          { name: 'Extra Salan & Raita', price: 40 },
          { name: 'Extra Chicken Piece', price: 90 },
        ],
      },
      {
        name: 'Veg Biryani',
        slug: 'veg-biryani',
        description: 'Aromatic basmati rice cooked with fresh seasonal garden vegetables, paneer cubes, and hand-ground spices in traditional dum pukht style.',
        photo: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80',
        category: catMap['dum-biryani'],
        basePrice: 280,
        priceByCity: { Hyderabad: 280, Bangalore: 310 },
        isVeg: true,
        spiceLevel: 2,
        allergens: ['Dairy'],
        portions: [
          { name: 'Regular', price: 0 },
          { name: 'Family Pack', price: 320 },
        ],
        addOns: [
          { name: 'Extra Fried Onions (Birista)', price: 30 },
          { name: 'Extra Paneer Cubes', price: 60 },
        ],
      },
      {
        name: 'Mutton Haleem',
        slug: 'mutton-haleem',
        description: 'Authentic GI-tagged Hyderabadi Haleem. Boneless tender mutton slow-cooked for 10 hours with broken wheat, pure ghee, lentils, and rich spices. Garnished with fried onions, cashews, and fresh mint.',
        photo: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
        category: catMap['haleem-curries'],
        basePrice: 350,
        priceByCity: { Hyderabad: 350, Bangalore: 390 },
        isVeg: false,
        spiceLevel: 4,
        allergens: ['Wheat (Gluten)', 'Nuts', 'Dairy'],
        portions: [
          { name: 'Standard Bowl (350ml)', price: 0 },
          { name: 'Large Bowl (600ml)', price: 250 },
        ],
        addOns: [
          { name: 'Extra Pure Desi Ghee', price: 35 },
          { name: 'Roasted Cashews & Mint', price: 45 },
          { name: 'Zabaan (Tongue) Topping', price: 80 },
        ],
      },
      {
        name: 'Mirchi Ka Salan',
        slug: 'mirchi-ka-salan',
        description: 'Traditional Hyderabadi chilli gravy made from roasted peanuts, sesame seeds, tamarind, and coconut paste. The iconic accompaniment to dum biryani.',
        photo: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
        category: catMap['haleem-curries'],
        basePrice: 80,
        isVeg: true,
        spiceLevel: 3,
        allergens: ['Peanuts', 'Sesame'],
      },
      {
        name: 'Chicken 65',
        slug: 'chicken-65',
        description: 'Legendary Hyderabad street starter. Bite-sized spicy fried chicken tossed with curry leaves, crushed garlic, and green chillies.',
        photo: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80',
        category: catMap['starters-kebabs'],
        basePrice: 280,
        isVeg: false,
        spiceLevel: 4,
        allergens: ['Egg'],
      },
      {
        name: 'Double Ka Meetha',
        slug: 'double-ka-meetha',
        description: 'Hyderabad’s royal bread pudding dessert, fried in pure desi ghee, soaked in saffron cardamom milk rabri, and generously topped with pistachios and almonds.',
        photo: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
        category: catMap['desserts-sweets'],
        basePrice: 190,
        isVeg: true,
        spiceLevel: 1,
        allergens: ['Gluten', 'Dairy', 'Nuts'],
      },
    ];

    const menuItems = await MenuItem.insertMany(menuItemsData);
    const itemMap = {};
    menuItems.forEach((i) => {
      itemMap[i.slug] = i;
    });

    // 5. Seed Coupons
    console.log('[Seed] Seeding Promo Coupons...');
    const couponsData = [
      {
        code: 'WELCOME10',
        description: '10% off on your first direct order, max discount ₹100',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 200,
        maxDiscountAmount: 100,
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'BIRYANI50',
        description: 'Flat ₹50 off on orders above ₹500',
        discountType: 'flat',
        discountValue: 50,
        minOrderValue: 500,
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        code: 'PARTY20',
        description: '20% off on bulk & party orders above ₹2,000',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 2000,
        maxDiscountAmount: 600,
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];
    await Coupon.insertMany(couponsData);

    // 6. Seed Sample Orders from the Brief
    console.log('[Seed] Seeding Sample Orders from Brief (WEB-778120, WEB-778131, WEB-778146)...');
    const now = new Date();
    const ordersData = [
      {
        orderId: 'WEB-778120',
        customer: customer._id,
        customerName: customer.name,
        customerPhone: customer.phone,
        outlet: outletMap['kondapur']._id,
        items: [
          {
            menuItem: itemMap['chicken-dum-biryani']._id,
            name: 'Chicken Dum Biryani (Family Pack)',
            isVeg: false,
            quantity: 1,
            portion: { name: 'Family Pack (Serves 3-4)', price: 420 },
            unitPrice: 800,
            itemTotal: 800,
          },
          {
            menuItem: itemMap['double-ka-meetha']._id,
            name: 'Double Ka Meetha',
            isVeg: true,
            quantity: 2,
            portion: { name: 'Standard', price: 0 },
            unitPrice: 190,
            itemTotal: 380,
          },
        ],
        subtotal: 1180,
        gst: 56.19, // 5% included
        total: 1180,
        paymentMethod: PAYMENT_METHODS.UPI,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        status: ORDER_STATUS.PREPARING,
        placedAt: new Date(now.getTime() - 25 * 60 * 1000),
        promisedTime: new Date(now.getTime() + 20 * 60 * 1000), // on time
      },
      {
        orderId: 'WEB-778131',
        customer: users[1]._id,
        customerName: users[1].name,
        customerPhone: users[1].phone,
        outlet: outletMap['gachibowli-cloud-kitchen']._id,
        items: [
          {
            menuItem: itemMap['veg-biryani']._id,
            name: 'Veg Biryani',
            isVeg: true,
            quantity: 2,
            portion: { name: 'Regular', price: 0 },
            unitPrice: 280,
            itemTotal: 560,
          },
          {
            menuItem: itemMap['mirchi-ka-salan']._id,
            name: 'Mirchi Ka Salan',
            isVeg: true,
            quantity: 1,
            portion: { name: 'Standard', price: 0 },
            unitPrice: 80,
            itemTotal: 80,
          },
        ],
        subtotal: 640,
        gst: 30.48,
        total: 640,
        paymentMethod: PAYMENT_METHODS.CARD,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        status: ORDER_STATUS.READY,
        placedAt: new Date(now.getTime() - 35 * 60 * 1000),
        promisedTime: new Date(now.getTime() + 5 * 60 * 1000),
        actualReadyTime: new Date(now.getTime() - 2 * 60 * 1000),
      },
      {
        orderId: 'WEB-778146',
        customer: users[2]._id,
        customerName: users[2].name,
        customerPhone: users[2].phone,
        outlet: outletMap['kukatpally']._id,
        items: [
          {
            menuItem: itemMap['mutton-haleem']._id,
            name: 'Mutton Haleem',
            isVeg: false,
            quantity: 3,
            portion: { name: 'Standard Bowl (350ml)', price: 0 },
            unitPrice: 350,
            itemTotal: 1050,
          },
        ],
        subtotal: 1050,
        gst: 50.0,
        total: 1050,
        paymentMethod: PAYMENT_METHODS.UPI,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        status: ORDER_STATUS.PREPARING,
        placedAt: new Date(now.getTime() - 40 * 60 * 1000),
        promisedTime: new Date(now.getTime() - 4 * 60 * 1000), // Late by 4 minutes!
      },
    ];

    await Order.insertMany(ordersData);

    console.log('[Seed] Database seeded successfully!');
    console.log(`- Outlets: ${outlets.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Menu Items: ${menuItems.length}`);
    console.log(`- Coupons: ${couponsData.length}`);
    console.log(`- Orders: ${ordersData.length}`);
  } catch (error) {
    console.error('[Seed Error]', error);
    throw error;
  }
};

// If run directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
