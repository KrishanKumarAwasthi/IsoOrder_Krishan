import { Outlet } from '../models/Outlet.model.js';

// Haversine distance calculator in kilometers
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const getAllOutlets = async (req, res, next) => {
  try {
    const outlets = await Outlet.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: outlets.length, data: outlets });
  } catch (error) {
    next(error);
  }
};

export const getNearbyOutlets = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude (lat) and Longitude (lng) are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const allOutlets = await Outlet.find({ isActive: true });

    // Calculate distance and filter by delivery radius
    const nearby = allOutlets
      .map((outlet) => {
        const [outLng, outLat] = outlet.location.coordinates;
        const distanceKm = getDistanceFromLatLonInKm(latitude, longitude, outLat, outLng);
        const isWithinRadius = distanceKm <= outlet.deliveryRadiusKm;
        return {
          ...outlet.toObject(),
          distanceKm: parseFloat(distanceKm.toFixed(1)),
          isDeliverable: isWithinRadius,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.status(200).json({
      success: true,
      userLocation: { lat: latitude, lng: longitude },
      count: nearby.length,
      data: nearby,
    });
  } catch (error) {
    next(error);
  }
};

export const getOutletById = async (req, res, next) => {
  try {
    const outlet = await Outlet.findById(req.params.id);
    if (!outlet) {
      return res.status(404).json({ error: 'Outlet not found' });
    }
    res.status(200).json({ success: true, data: outlet });
  } catch (error) {
    next(error);
  }
};

