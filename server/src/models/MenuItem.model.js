import mongoose from 'mongoose';

const addOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const portionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. Single, Family Pack, Jumbo
    price: { type: Number, required: true, min: 0 }, // Additional price or total portion price
  },
  { _id: true }
);

const outletAvailabilitySchema = new mongoose.Schema(
  {
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price must be positive'],
    },
    // Prices configurable by city
    priceByCity: {
      type: Map,
      of: Number,
      default: {},
    },
    isVeg: {
      type: Boolean,
      required: true,
      default: false,
    },
    spiceLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    allergens: [
      {
        type: String,
        trim: true,
      },
    ],
    addOns: [addOnSchema],
    portions: [portionSchema],
    outletAvailability: [outletAvailabilitySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate price for a specific city
menuItemSchema.methods.getPriceForCity = function (cityName = 'Hyderabad') {
  if (this.priceByCity && this.priceByCity.get(cityName)) {
    return this.priceByCity.get(cityName);
  }
  return this.basePrice;
};

// Method to check if item is available at an outlet
menuItemSchema.methods.isAvailableAtOutlet = function (outletId) {
  if (!this.isActive) return false;
  if (!this.outletAvailability || this.outletAvailability.length === 0) return true;
  const record = this.outletAvailability.find(
    (a) => a.outlet.toString() === outletId.toString()
  );
  return record ? record.isAvailable : true;
};

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);

