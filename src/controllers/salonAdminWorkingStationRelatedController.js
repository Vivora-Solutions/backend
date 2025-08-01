import {
  handleAddOrEditServicesToWorkingStation,
  handleCreateWorkingStation,
  handleEditWorkingStation,
  handleGetAllWorkingStations,
  handleGetServicesOfWorkingStation,
} from "../services/salonAdminWokingStationRelatedService.js";

export const getAllWorkingStations = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: "User ID not found" });

    const result = await handleGetAllWorkingStations(user_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWorkingStation = async (req, res) => {
  try {
    const user_id = req.userId;
    const { workstation_name } = req.body;

    if (!user_id || !workstation_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await handleCreateWorkingStation(user_id, workstation_name);
    res.status(201).json(result);
  } catch (err) {
    console.error("Error in createWorkingStation:", err); // ✅ Log full error
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
};

export const editWorkingStation = async (req, res) => {
  try {
    const user_id = req.userId;
    const { workstation_id, workstation_name } = req.body;

    if (!user_id || !workstation_id || !workstation_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await handleEditWorkingStation(
      user_id,
      workstation_id,
      workstation_name
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getServicesOfWorkingStation = async (req, res) => {
  try {
    const user_id = req.userId;
    const { station_id } = req.params;

    if (!user_id || !station_id) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const result = await handleGetServicesOfWorkingStation(user_id, station_id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addOrEditWorkingStationServices = async (req, res) => {
  try {
    const user_id = req.userId;
    const { station_id, service_ids } = req.body;

    if (!user_id || !station_id || !Array.isArray(service_ids)) {
      return res.status(400).json({ error: "Missing or invalid request data" });
    }

    const result = await handleAddOrEditServicesToWorkingStation(
      user_id,
      station_id,
      service_ids
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
