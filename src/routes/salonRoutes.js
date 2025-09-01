import express from "express";
import {
  getAllSalons,
  getSalonById,
  getSalonsByLocation,
  getSalonsByName,
  getSalonsByType,
  getStylistsBySalonId,
  //getAvailableTimeSlots,
  getSalonsByServiceName,
  fetchSalonServices,
  //fetchAvailableTimeSlots,
  getServiceById,
  fetchAvailableTimeSlotsSithum,
  getAllAvailableTimeSlots,
} from "../controllers/salonController.js";

import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all salons
router.get("/", getAllSalons);
// Get salons by ID
router.get("/by-id/:id", getSalonById); // http://localhost:3000/api/salons/c49cf780-e2db-4a94-b1f2-bf2aa47f785b
// Get salons by location
// router.get('/location', getSalonsByLocation);         //not working
// Get salons by name
//router.get('/name/:name', getSalonsByName);           // http://localhost:3000/api/salons/name/Sithum
// Get salons by service type
//router.get('/by-service', getSalonsByServiceName);    //http://localhost:3000/api/salons/by-service?name=Haircut
// Get salons by type unisex, male, female
//router.get('/type/:id', getSalonsByType);                               //http://localhost:3000/api/salons/type/2da738de-ab0e-4cc5-9e5a-a4bfcbb43dc0
// Get all stylists by salon ID
// router.get('/:id/stylists', getStylistsBySalonId);                    //http://localhost:3000/api/salons/2da738de-ab0e-4cc5-9e5a-a4bfcbb43dc0/stylists
// Get available time slots for a stylist
//router.get('/stylist/:stylistId/availability', getAvailableTimeSlots);  //http://localhost:3000/api/salons/stylist/b5991531-a0e1-460e-bce9-3dee1056d3b6/availability
// Get all services of a salon
router.get("/:salonId/services", fetchSalonServices);

// Get available time slots
//router.post('/available-time-slots', fetchAvailableTimeSlots);
// Get service details and salon details using service id
router.get("/service-details", requireAuth, getServiceById);

// Get available time slots
//router.post('/available-time-slots', fetchAvailableTimeSlots);
router.post("/available-time-slots-sithum", fetchAvailableTimeSlotsSithum);

// Get all available time slots from all stylists
router.post("/available-time-slots-all", getAllAvailableTimeSlots);

export default router;
