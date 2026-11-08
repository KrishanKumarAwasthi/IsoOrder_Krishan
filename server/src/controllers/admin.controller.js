import { MenuItem } from '../models/MenuItem.model.js';
import { Category } from '../models/Category.model.js';
import { Outlet } from '../models/Outlet.model.js';
import { getIO } from '../socket/index.js';
import { SOCKET_EVENTS } from '../shared/constants.js';

// --- Menu Items CRUD ---
export const getAllMenuItemsAdmin = async (req, res, next) => {
  try {
    const items = await MenuItem.find().populate('category').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      photo,
      category,
      basePrice,
      priceByCity,
      isVeg,
      spiceLevel,
      allergens,
      addOns,
      portions,
    } = req.body;

    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const item = await MenuItem.create({
      name,
      slug: autoSlug,
      description,
      photo,
      category,
      basePrice,
      priceByCity: priceByCity || {},
      isVeg: !!isVeg,
      spiceLevel: spiceLevel || 3,
      allergens: allergens || [],
      addOns: addOns || [],
      portions: portions || [],
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category');

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Toggle item stock / availability for a specific outlet
export const toggleOutletAvailability = async (req, res, next) => {
  try {
    const { outletId, isAvailable } = req.body;
    const { id } = req.params;

    const item = await MenuItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const existingIndex = item.outletAvailability.findIndex(
      (entry) => entry.outlet.toString() === outletId.toString()
    );

    if (existingIndex > -1) {
      item.outletAvailability[existingIndex].isAvailable = isAvailable;
    } else {
      item.outletAvailability.push({ outlet: outletId, isAvailable });
    }

    await item.save();

    // Broadcast to kitchen / customer via Socket.IO
    try {
      const io = getIO();
      io.to(`outlet:${outletId}`).emit(SOCKET_EVENTS.ITEM_AVAILABILITY_CHANGED, {
        itemId: item._id,
        outletId,
        isAvailable,
      });
    } catch (e) {
      // Socket not initialized or testing mode
    }

    res.status(200).json({
      success: true,
      message: `Item availability updated for outlet ${outletId}`,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// --- Categories CRUD ---
export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, displayOrder, timeSlots } = req.body;
    const autoSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = await Category.create({
      name,
      slug: autoSlug,
      description,
      displayOrder: displayOrder || 0,
      timeSlots: timeSlots || ['all'],
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- Outlets Admin ---
export const getAllOutletsAdmin = async (req, res, next) => {
  try {
    const outlets = await Outlet.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: outlets });
  } catch (error) {
    next(error);
  }
};

export const updateOutletAdmin = async (req, res, next) => {
  try {
    const outlet = await Outlet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.status(200).json({ success: true, data: outlet });
  } catch (error) {
    next(error);
  }
};

