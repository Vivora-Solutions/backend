import {
  fetchAllSalon,
  fetchSalonById,
  fetchSalonsByLocation,
  fetchSalonsByName,
  fetchSalonsByService,
  fetchSalonsByType,
  fetchStylistsBySalon,
  fetchStylistAvailability,
  fetchSalonsByServiceName
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


export const getSalonsByLocation = async (req, res) => {
  try {
    const { location, radius } = req.body;

    if (
      !location ||
      typeof location.latitude !== 'number' ||
      typeof location.longitude !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid or missing location data' });
    }

    const data = await fetchSalonsByLocation(location, radius);
    res.json(data);
  } catch (err) {
    console.error("getSalonsByLocation error:", err.message);
    res.status(500).json({ error: 'Failed to fetch salons by location' });
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



export const getSalonsByServiceName = async (req, res) => {
  try {
    const name = req.query.name;
    console.log(name);

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Service name is required in query' });
    }

    const salons = await fetchSalonsByServiceName(name);
    return res.status(200).json(salons);
  } catch (err) {
    console.error('getSalonsByServiceName error:', err);

    const status = err.status || 500;
    const message = err.message || 'Unexpected server error';

    return res.status(status).json({ error: message });
  }
};

