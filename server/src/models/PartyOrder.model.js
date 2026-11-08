import mongoose from 'mongoose';

const partyOrderSchema = new mongoose.Schema(
  {
    orderReference: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date and time is required'],
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [15, 'Minimum party order is 15 guests'],
    },
    packageType: {
      type: String,
      enum: ['nizami_feast', 'royal_biryani_celebration', 'custom_buffet'],
      default: 'royal_biryani_celebration',
    },
    estimatedBudget: {
      type: Number,
      default: 18000, // Average ₹18,000 from client brief
    },
    specialRequests: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending_confirmation', 'confirmed', 'declined'],
      default: 'pending_confirmation',
    },
    confirmedByManager: {
      type: String,
      default: null,
    },
    managerNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate minimum notice (e.g. at least 24 hours in advance)
partyOrderSchema.statics.validateMinimumNotice = function (requestedDate, minimumHoursNotice = 24) {
  const now = new Date();
  const event = new Date(requestedDate);
  const diffHours = (event.getTime() - now.getTime()) / (1000 * 60 * 60);
  return {
    valid: diffHours >= minimumHoursNotice,
    hoursProvided: Math.round(diffHours),
    minimumRequired: minimumHoursNotice,
  };
};

export const PartyOrder = mongoose.model('PartyOrder', partyOrderSchema);

