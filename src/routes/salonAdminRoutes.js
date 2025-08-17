import express from 'express';

import {
  updateSalonDetails,
  addBannerImage,
  deleteBannerImage,
  updateBannerImage,
  getSalonDetailsController,
  getBannerImages,
  updateOpeningHoursForWeek, getOpeningHoursForSalon

} from '../controllers/salonAdminBasicController.js';


import {
  getStylist,
  getAllStylists,
  addStylist,
  addServicesToStylist,
  disableServicesFromStylist,
  getServicesOfStylist,
  updateStylist, activateStylist, disableStylist
} from '../controllers/salonAdminStylistRelatedController.js';

import {
  addService,
  deleteService,
  getAllServices,
  updateService
} from '../controllers/salonAdminServiceRelatedController.js';

import {
  getAllStylistsForSalon,
  toggleStylistActiveStatus,
  addStylistSchedule,
  updateStylistSchedule,
  getAllStylistsWithSchedule,
  addStylistLeave,
  editStylistLeave,
  deleteStylistLeave,
  getAllLeavesForStylist,
  getStylistsForSchedule,
  getStylistsWithSchedule,
  getAllLeavesForSalon,
} from "../controllers/salonAdminscheduleRelatedController.js";

import {
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings, getBookingsOfStylist,
  completeBooking,
} from '../controllers/salonAdminBookingRelatedController.js';


import {
  addOrEditWorkingStationServices,
  createWorkingStation,
  editWorkingStation,
  getAllWorkingStations, getServicesOfWorkingStation
} from "../controllers/salonAdminWorkingStationRelatedController.js";

import {requireSalonAdmin} from "../middlewares/requireSalonAdmin.js";
import { requireAuth } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.use(requireAuth);
router.use(requireSalonAdmin);
// Update salon fields - can't update is_approve field using that
router.put('/update', updateSalonDetails);
//  Get details about salon
router.get('/my', getSalonDetailsController);



// 2.Banner Image management



// Get banner images
router.get('/images', getBannerImages);

router.post('/images', addBannerImage);
// Delete banner image
router.delete('/images/:imageId', deleteBannerImage);
// Update banner image
router.put('/images/:imageId', updateBannerImage);



// 3.Stylist management

//Get all Stylist
router.get("/stylist/:stylist_id", getStylist);
// Get one Stylist
router.get("/stylists", getAllStylists);
// Add stylist
router.post('/stylist', addStylist);
// Activate stylist
router.put('/stylist/activate/:stylist_id', activateStylist);
// Disable stylist
router.put('/stylist/disable/:stylist_id', disableStylist);
// Update stylist details
router.put('/stylist/:stylist_id', updateStylist);
// Add service to a stylist
router.post('/stylist/services', addServicesToStylist);
// Remove service from stylist
router.put('/stylist/:stylist_id/disable-services', disableServicesFromStylist);
// Get all services of a stylist
router.get('/stylist/:stylist_id/services', getServicesOfStylist);




// 4. Service management



router.get('/services', getAllServices);
// Add new service to the salon
router.post('/services', addService);
//Update Service
router.put('/services/:serviceId', updateService);



// 4. Schedule management

// Get one stylist schedule
router.get("/schedule/stylists/:stylistId", getStylistsWithSchedule);
// Get all stylists and their schedules for a salon
router.get("/schedule/stylists", getAllStylistsWithSchedule);
// Add a new schedule for a stylist
router.post("/schedule/stylists/:stylistId", addStylistSchedule);
// // Update an existing stylist schedule
router.put("/schedule/stylists/:stylistId/:scheduleId", updateStylistSchedule);
// // Toggle stylist active status
router.put('/schedule/stylists/:stylistId/status', toggleStylistActiveStatus);
// // Add a leave for a stylist
router.post("/schedule/stylists/:stylistId/leave", addStylistLeave);
//Edit leave for a stylist
router.put("/schedule/stylists/:stylistId/leave/:leaveId", editStylistLeave);
//Delete leave for a stylist
router.delete("/schedule/stylists/:stylistId/leave/:leaveId", deleteStylistLeave);
//Get all leaves for a stylist
router.get("/schedule/stylists/:stylistId/leaves", getAllLeavesForStylist);
//Get all leaves for a salon
router.get("/schedule/leaves", getAllLeavesForSalon);




// 5. Booking management


router.get("/booking", getAllBookings);
// Create non-online customer booking
router.post("/booking", createBooking);
// Edit details of a booking only for that salon admin
router.put("/booking/:bookingId", updateBooking);
// Delete a booking only for that salon admin have access
router.delete("/bookings/:bookingId", deleteBooking);

router.put("/bookings/c/:bookingId", completeBooking);
//Booking for a stylist
router.get("/booking/stylist/:stylistId", getBookingsOfStylist);






// 6. Opening Hours management

router.get('/opening-hours', getOpeningHoursForSalon);
router.post('/opening-hours', updateOpeningHoursForWeek)





// 7. Working station management

// 1. Get all working stations in the salon
router.get('/working-stations', getAllWorkingStations);
// 2. Create a new working station
router.post('/working-stations', createWorkingStation);
// 3. Edit a working station
router.put('/working-stations', editWorkingStation);
// 4. Get all services of a specific working station
router.get('/working-stations/:station_id/services', getServicesOfWorkingStation);
// 5. Add or edit services for a working station
router.post('/working-stations/services', addOrEditWorkingStationServices);



export default router;
