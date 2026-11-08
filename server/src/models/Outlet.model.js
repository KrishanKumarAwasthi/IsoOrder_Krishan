import mongoose from 'mongoose';
import { OUTLET_TYPES } from '../shared/constants.js';

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Outlet name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: Object.values(OUTLET_TYPES),
      default: OUTLET_TYPES.RETAIL,
    },
    city: {
      type: String,
      default: 'Hyderabad',
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      // GeoJSON standard: [longitude, latitude]
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    deliveryRadiusKm: {
      type: Number,
      default: 8, // 8 km delivery radius
    },
    fssaiLicence: {
      type: String,
      required: [true, 'FSSAI licence number is mandatory'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    operatingHours: {
      open: { type: String, default: '11:00' },
      close: { type: String, default: '23:30' },
    },
    minimumPrepTime: {
      type: Number,
      default: 25, // default 25 minutes
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial proximity queries
outletSchema.index({ location: '2dsphere' });

export const Outlet = mongoose.model('Outlet', outletSchema);

