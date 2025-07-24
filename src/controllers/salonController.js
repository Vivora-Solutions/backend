import {
  fetchAllSalon,
  fetchSalonById,
  fetchSalonsByLocation,
  fetchSalonsByName,
  fetchSalonsByService,
  fetchSalonsByType,
  fetchStylistsBySalon,
  fetchStylistAvailability,
  fetchSalonBannerByID
} from '../services/salonService.js';

export const getAllSalons = async (req, res) => {
  try {
    const data = await fetchAllSalon();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalonById = async (req, res) => {
  try {
    const data = await fetchSalonById(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getSalonBannerByID= async (req, res) => {
  const salon_id = req.params.salon_id;
  if (!salon_id) {
    return res.status(400).json({ error: 'Salon ID is required.' });
  }
  try {
    const data = await fetchSalonBannerByID(salon_id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};


export const getSalonsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius_km } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const data = await fetchSalonsByLocation({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius_km: parseFloat(radius_km) || 5,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalonsByName = async (req, res) => {
  try {
    const data = await fetchSalonsByName(req.params.name);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalonsByServiceType = async (req, res) => {
  try {
    const data = await fetchSalonsByService(req.params.serviceType);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSalonsByType = async (req, res) => {
  try {
    const data = await fetchSalonsByType(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStylistsBySalonId = async (req, res) => {
  try {
    const data = await fetchStylistsBySalon(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAvailableTimeSlots = async (req, res) => {
  try {
    const data = await fetchStylistAvailability(req.params.stylistId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
