import {
    handleGetAllStylistsForSalon,
    handleToggleStylistActiveStatus,
    handleAddStylistSchedule,
    handleUpdateStylistSchedule,
} from '../services/salonAdminScheduleRelatedService.js';


export const getAllStylistsForSalon = async (req, res) => {
  try {
    const user_id = req.userId;

    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await handleGetAllStylistsForSalon(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const toggleStylistActiveStatus = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylistId } = req.params;
    const { is_active } = req.body;

    if (!user_id || !stylistId || is_active === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleToggleStylistActiveStatus(user_id, stylistId, is_active);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const addStylistSchedule = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id, day_of_week, start_time_daily, end_time_daily } = req.body;

    if (!user_id || !stylist_id || day_of_week === undefined || !start_time_daily || !end_time_daily) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleAddStylistSchedule(user_id, {
      stylist_id,
      day_of_week,
      start_time_daily,
      end_time_daily
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const updateStylistSchedule = async (req, res) => {
  try {
    const user_id = req.userId;
    const { scheduleId } = req.params;
    const updateData = req.body;

    if (!user_id || !scheduleId || !updateData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await handleUpdateStylistSchedule(user_id, scheduleId, updateData);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




