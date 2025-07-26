import {
  handleUpdateSalonDetails,
  handleAddBannerImage,
  handleDeleteBannerImage,
  handleUpdateBannerImage,
  getSalonDetailsByUserId,
  getSalonAndBannerImagesByUserId,
  handleGetBannerImages,
  handleUpsertOpeningHoursForWeek,
  handleGetOpeningHoursForSalon
} from '../services/salonAdminBasicService.js';

// Update salon fields
export const updateSalonDetails = async (req, res) => {
  try {

    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });

    const result = await handleUpdateSalonDetails(user_id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GetBannerImages
export const getBannerImages = async (req, res) => {
  try {
    const user_id = req.userId; // Assumes middleware attaches userId to req

    if (!user_id) {
      return res.status(400).json({ error: 'Salon Owner ID not found for this user' });
    }

    const images = await handleGetBannerImages(user_id);
    res.status(200).json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Add new banner image
export const addBannerImage = async (req, res) => {
  try {
     
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });

    const result = await handleAddBannerImage(user_id, req.body.image_link);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete banner image
export const deleteBannerImage = async (req, res) => {

  try {

    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });

    const result = await handleDeleteBannerImage(user_id, req.params.imageId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update existing image in gallery
export const updateBannerImage = async (req, res) => {
  try {

    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });

    const result = await handleUpdateBannerImage(user_id, req.params.imageId, req.body.image_link);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const getSalonDetailsController = async (req, res) => {
//   try {
//     const user_id = req.userId; // Provided by requireAuth middleware
//     const salonDetails = await getSalonDetailsByUserId(user_id);
//     res.status(200).json(salonDetails);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// };

export const getSalonDetailsController = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const salonWithImages = await getSalonAndBannerImagesByUserId(user_id);
    res.status(200).json(salonWithImages);
  } catch (error) {
    console.error('[GET SALON ERROR]', error.message);
    res.status(404).json({ error: error.message });
  }
};

export const updateOpeningHoursForWeek = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'Unauthorized request' });

    const daysData = req.body.daysData;
    if (!Array.isArray(daysData) || daysData.length !== 7) {
      return res.status(400).json({ error: 'daysData should be an array of 7 days' });
    }

    const result = await handleUpsertOpeningHoursForWeek(user_id, daysData);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOpeningHoursForSalon = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'Unauthorized' });

    const result = await handleGetOpeningHoursForSalon(user_id);
    res.status(200).json({ days: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


