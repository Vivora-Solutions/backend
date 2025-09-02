import {
  handleGetAllStylistsForSalon,
  handleToggleStylistActiveStatus,
  handleAddStylistSchedule,
  handleUpdateStylistSchedule,
  handleGetAllStylistsWithSchedule,
  handleAddStylistLeave,
  handleEditStylistLeave,
  handleDeleteStylistLeave,
  handleGetAllLeavesForStylist,
  handleGetStylistsWithSchedule,
  handleGetAllLeavesForSalon,
  getScheduleOverviewService,
} from "../services/salonAdminScheduleRelatedService.js";
import { addStylist } from "./salonAdminStylistRelatedController.js";

export const getAllStylistsForSalon = async (req, res) => {
  try {
    const user_id = req.userId;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await handleGetAllStylistsForSalon(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStylistsForSchedule = async (req, res) => {
  try {
    // console.log("Fetching stylists for schedule...");
    const { stylistId } = req.params;

    const result = await handleGetStylistsForSchedule(stylistId);
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
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await handleToggleStylistActiveStatus(
      user_id,
      stylistId,
      is_active
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStylistsWithSchedule = async (req, res) => {
  try {
    const user_id = req.userId;
    const { stylistId } = req.params;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await handleGetStylistsWithSchedule(user_id, stylistId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllStylistsWithSchedule = async (req, res) => {
  try {
    const user_id = req.userId;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await handleGetAllStylistsWithSchedule(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const addStylistSchedule = async (req, res) => {
  try {
    //console.log("Adding stylist schedule...");
    const user_id = req.userId;
    const stylist_id = req.params.stylistId;
    const { day_of_week, start_time_daily, end_time_daily } = req.body;
    //console.log(req.body);

    if (
      !user_id ||
      !stylist_id ||
      day_of_week === undefined ||
      !start_time_daily ||
      !end_time_daily
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await handleAddStylistSchedule(user_id, {
      stylist_id,
      day_of_week,
      start_time_daily,
      end_time_daily,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const updateStylistSchedule = async (req, res) => {
//   try {
//     const user_id = req.userId;
//     const { scheduleId } = req.params;
//     const updateData = req.body;

//     if (!user_id || !scheduleId || !updateData) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const result = await handleUpdateStylistSchedule(user_id, scheduleId, updateData);
//     res.status(200).json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const updateStylistSchedule = async (req, res) => {
  console.log("Updating stylist schedule...");
  try {
    //console.log("Now in controller")
    // console.log(req.body)

    const user_id = req.userId;
    const stylist_id = req.params.stylistId;
    const schedule_id = req.params.scheduleId;
    let { day_of_week, start_time_daily, end_time_daily, created } = req.body;

    if (
      !user_id ||
      !stylist_id ||
      !schedule_id ||
      day_of_week === undefined ||
      !start_time_daily ||
      !end_time_daily
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // convert day_of_week -> number  (0 = Sunday)
    if (typeof day_of_week === "string") {
      const dayMap = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      day_of_week = dayMap[day_of_week.toLowerCase()];
    } else {
      // ensure numeric strings become numbers
      day_of_week = Number(day_of_week);
    }

    const result = await handleUpdateStylistSchedule(user_id, {
      stylist_id,
      schedule_id,
      day_of_week,
      start_time_daily,
      end_time_daily,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addStylistLeave = async (req, res) => {
  try {
    const user_id = req.userId;
    const stylist_id = req.params.stylistId;
    const { date, leave_start_time, leave_end_time } = req.body;

    if (
      !user_id ||
      !stylist_id ||
      !date ||
      !leave_start_time ||
      !leave_end_time
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Assuming you have a function to handle adding stylist leave
    const result = await handleAddStylistLeave(user_id, {
      stylist_id,
      date,
      leave_start_time,
      leave_end_time,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editStylistLeave = async (req, res) => {
  try {
    const user_id = req.userId;
    const stylist_id = req.params.stylistId;
    const leave_id = req.params.leaveId;
    const { date, leave_start_time, leave_end_time } = req.body;

    if (
      !user_id ||
      !stylist_id ||
      !leave_id ||
      !date ||
      !leave_start_time ||
      !leave_end_time
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Assuming you have a function to handle editing stylist leave
    const result = await handleEditStylistLeave(user_id, {
      stylist_id,
      leave_id,
      date,
      leave_start_time,
      leave_end_time,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteStylistLeave = async (req, res) => {
  try {
    const user_id = req.userId;
    const stylist_id = req.params.stylistId;
    const leave_id = req.params.leaveId;

    if (!user_id || !stylist_id || !leave_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Assuming you have a function to handle deleting stylist leave
    const result = await handleDeleteStylistLeave(user_id, {
      stylist_id,
      leave_id,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllLeavesForStylist = async (req, res) => {
  try {
    const user_id = req.userId;
    const stylist_id = req.params.stylistId;

    if (!user_id || !stylist_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await handleGetAllLeavesForStylist(user_id, stylist_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllLeavesForSalon = async (req, res) => {
  try {
    const user_id = req.userId;

    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await handleGetAllLeavesForSalon(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getScheduleOverview = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const result = await getScheduleOverviewService(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
