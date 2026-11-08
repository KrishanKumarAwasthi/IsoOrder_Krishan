import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../shared/constants.js';

const addressSchema = new mongoose.Schema(
  {
    tag: { type: String, default: 'Home' }, // Home, Work, Other
    addressLine: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, default: 'Hyderabad' },
    pincode: { type: String },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [78.3826, 17.4483], // default Hyderabad coordinates
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    // For kitchen staff: assigned outlet
    assignedOutlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      default: null,
    },
    loyaltyPoints: {
      type: Number,
      default: 100, // 100 welcome bonus points (= ₹10)
      min: 0,
    },
    // Compliance with DPDP Act 2023
    marketingOptIn: {
      type: Boolean,
      default: false,
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);

