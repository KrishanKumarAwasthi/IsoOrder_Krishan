import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_at_least_32_characters_long_isoorder_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role, marketingOptIn } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
      marketingOptIn: !!marketingOptIn,
      loyaltyPoints: 100, // 100 welcome bonus points
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        marketingOptIn: user.marketingOptIn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('assignedOutlet');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        assignedOutlet: user.assignedOutlet,
        loyaltyPoints: user.loyaltyPoints,
        marketingOptIn: user.marketingOptIn,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('assignedOutlet');
  res.status(200).json({
    success: true,
    user,
  });
};

export const updateMarketingConsent = async (req, res, next) => {
  try {
    const { marketingOptIn } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { marketingOptIn: !!marketingOptIn },
      { new: true }
    );
    res.status(200).json({
      success: true,
      marketingOptIn: user.marketingOptIn,
      message: 'Marketing preference updated in accordance with DPDP Act 2023',
    });
  } catch (error) {
    next(error);
  }
};

