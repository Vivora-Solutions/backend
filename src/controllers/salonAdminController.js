// import {
//   handleUpdateSalonDetails,
//   handleAddBannerImage,
//   handleDeleteBannerImage,
//   handleUpdateBannerImage
// } from '../services/salonAdminService.js';
//
// // Update salon fields
// export const updateSalonDetails = async (req, res) => {
//   try {
//
//     const user_id = req.userId;
//     if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });
//
//     const result = await handleUpdateSalonDetails(user_id, req.body);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
//
// // Add new banner image
// export const addBannerImage = async (req, res) => {
//   try {
//
//     const user_id = req.userId;
//     if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });
//
//     const result = await handleAddBannerImage(user_id, req.body.image_link);
//     res.status(201).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
//
// // Delete banner image
// export const deleteBannerImage = async (req, res) => {
//
//   try {
//
//     const user_id = req.userId;
//     if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });
//
//     const result = await handleDeleteBannerImage(user_id, req.params.imageId);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
//
// // Update existing image in gallery
// export const updateBannerImage = async (req, res) => {
//   try {
//
//     const user_id = req.userId;
//     if (!user_id) return res.status(400).json({ error: 'Salon Owner ID not found for this user' });
//
//     const result = await handleUpdateBannerImage(user_id, req.params.imageId, req.body.image_link);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
