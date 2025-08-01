import {
  handleGetAllStylists,
  handleAddStylist,
  handleDeleteStylist,
  handleUpdateStylistName,
  handleUpdateStylistContact,
  handleUpdateStylistProfilePic,
  handleDeleteStylistProfilePic,
  handleUpdateStylistBio,
  handleDeleteStylistBio,
  handleAddServicesToStylist,
  handleDeleteServicesFromStylist,
  handleGetServicesOfStylist,
} from "../services/salonAdminStylistRelatedServices.js";

export const getAllStylists = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'User ID missing' });

    const stylists = await handleGetAllStylists(user_id);
    res.status(200).json(stylists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addStylist = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: "User ID missing" });

    const result = await handleAddStylist(user_id, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStylist = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;

    if (!user_id || !stylist_id)
      return res.status(400).json({ error: "Missing required data" });

    const result = await handleDeleteStylist(user_id, stylist_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStylistName = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;
    const { new_name } = req.body;

    if (!new_name)
      return res.status(400).json({ error: "New name is required" });

    const result = await handleUpdateStylistName(user_id, stylist_id, new_name);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStylistContact = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;
    const { new_contact } = req.body;

    if (!new_contact)
      return res.status(400).json({ error: "New contact number is required" });

    const result = await handleUpdateStylistContact(
      user_id,
      stylist_id,
      new_contact
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStylistProfilePic = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;
    const { new_link } = req.body;

    if (!new_link)
      return res.status(400).json({ error: "New image link is required" });

    const result = await handleUpdateStylistProfilePic(
      user_id,
      stylist_id,
      new_link
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStylistProfilePic = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;

    const result = await handleDeleteStylistProfilePic(user_id, stylist_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateStylistBio = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;
    const { new_bio } = req.body;

    if (!new_bio) return res.status(400).json({ error: "New bio is required" });

    const result = await handleUpdateStylistBio(user_id, stylist_id, new_bio);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStylistBio = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylist_id } = req.params;

    const result = await handleDeleteStylistBio(user_id, stylist_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addServicesToStylist = async (req, res) => {
  const user_id = req.userId;
  const { stylist_id, service_ids } = req.body;

  if (!stylist_id || !Array.isArray(service_ids)) {
    return res
      .status(400)
      .json({ error: "Stylist ID and service_ids are required" });
  }

  try {
    const result = await handleAddServicesToStylist(
      user_id,
      stylist_id,
      service_ids
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteServicesFromStylist = async (req, res) => {
  const user_id = req.userId;
  const { stylist_id, service_ids } = req.body;

  if (!stylist_id || !Array.isArray(service_ids)) {
    return res
      .status(400)
      .json({ error: "Stylist ID and service_ids are required" });
  }

  try {
    const result = await handleDeleteServicesFromStylist(
      user_id,
      stylist_id,
      service_ids
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getServicesOfStylist = async (req, res) => {
  const user_id = req.userId;
  const { stylist_id } = req.params;

  if (!stylist_id) {
    return res.status(400).json({ error: "Stylist ID is required" });
  }

  try {
    const data = await handleGetServicesOfStylist(user_id, stylist_id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
