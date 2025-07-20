import {
  handleAddService,
  handleDeleteService,
  handleUpdateServicePrice,
  handleUpdateServiceDuration
} from '../services/salonAdminServiceRelatedServices.js';

export const addService = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'User ID not found' });

    const result = await handleAddService(user_id, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteService = async (req, res) => {
  try {
    const user_id = req.userId;
    const { serviceId } = req.params;

    if (!user_id || !serviceId) {
      return res.status(400).json({ error: 'Missing user or service ID' });
    }

    const result = await handleDeleteService(user_id, serviceId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateServicePrice = async (req, res) => {
  try {
    const user_id = req.userId;
    const { serviceId } = req.params;
    const { newPrice } = req.body;

    if (!user_id || !serviceId || newPrice === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleUpdateServicePrice(user_id, serviceId, newPrice);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateServiceDuration = async (req, res) => {
  try {
    const user_id = req.userId;
    const { serviceId } = req.params;
    const { newDuration } = req.body;

    if (!user_id || !serviceId || newDuration === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleUpdateServiceDuration(user_id, serviceId, newDuration);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
