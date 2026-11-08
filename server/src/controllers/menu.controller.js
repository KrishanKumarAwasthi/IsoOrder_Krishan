import { MenuItem } from '../models/MenuItem.model.js';
import { Category } from '../models/Category.model.js';
import { Outlet } from '../models/Outlet.model.js';
import { TIME_SLOTS } from '../shared/constants.js';

// Determine current time slot based on hour of day
function getCurrentTimeSlot() {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 11) return TIME_SLOTS.BREAKFAST;
  if (hour >= 11 && hour < 16) return TIME_SLOTS.LUNCH;
  if (hour >= 18 && hour < 23) return TIME_SLOTS.DINNER;
  return TIME_SLOTS.ALL;
}

export const getMenuByOutlet = async (req, res, next) => {
  try {
    const { outletId } = req.params;
    const { timeSlot, filterVeg } = req.query;

    const outlet = await Outlet.findById(outletId);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }

    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    const currentSlot = timeSlot || getCurrentTimeSlot();

    const query = { isActive: true };
    if (filterVeg === 'true') {
      query.isVeg = true;
    }

    const items = await MenuItem.find(query).populate('category');

    // Group items by category and compute availability & city-wise pricing
    const city = outlet.city || 'Hyderabad';

    const menuByCategory = categories
      .map((cat) => {
        const catItems = items
          .filter((item) => item.category && item.category._id.toString() === cat._id.toString())
          .map((item) => {
            const isAvailable = item.isAvailableAtOutlet(outlet._id);
            const cityPrice = item.getPriceForCity(city);
            return {
              _id: item._id,
              name: item.name,
              slug: item.slug,
              description: item.description,
              photo: item.photo,
              basePrice: cityPrice,
              isVeg: item.isVeg,
              spiceLevel: item.spiceLevel,
              allergens: item.allergens,
              portions: item.portions,
              addOns: item.addOns,
              isAvailable,
              category: {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
              },
            };
          });

        return {
          category: {
            _id: cat._id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
          },
          items: catItems,
        };
      })
      .filter((group) => group.items.length > 0);

    res.status(200).json({
      success: true,
      outlet: {
        _id: outlet._id,
        name: outlet.name,
        city: outlet.city,
        fssaiLicence: outlet.fssaiLicence,
        address: outlet.address,
        minimumPrepTime: outlet.minimumPrepTime,
        operatingHours: outlet.operatingHours,
      },
      currentSlot,
      categories: categories.map((c) => ({ _id: c._id, name: c.name, slug: c.slug })),
      menu: menuByCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

