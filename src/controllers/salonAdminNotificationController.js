import { getNotificationsForSalonAdmin } from "../services/salonAdminNotificationService.js";

export const getNotifications = async (req, res) => {
  try {
    const user_id = req.userId;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await getNotificationsForSalonAdmin(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
