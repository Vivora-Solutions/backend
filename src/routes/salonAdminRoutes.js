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
  getAllStylists,
  addStylist,
  deleteStylist,
  updateStylistName,
  updateStylistContact,
  updateStylistProfilePic,
  deleteStylistProfilePic,
  updateStylistBio,
  deleteStylistBio,
  addServicesToStylist,
  deleteServicesFromStylist,
  getServicesOfStylist,
  updateStylist
} from '../controllers/salonAdminStylistRelatedController.js';

import {
  addService,
  deleteService,
  updateServicePrice,
  updateServiceDuration,
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
  getStylistsForSchedule
} from "../controllers/salonAdminscheduleRelatedController.js";

import {
  createBooking,
  updateBooking,
  deleteBooking,
  getAllBookings, getBookingsOfStylist,
} from '../controllers/salonAdminBookingRelatedController.js';

import { requireAuth } from '../middlewares/authMiddleware.js';
import { getServiceById } from '../controllers/superAdminController.js';
import {
  addOrEditWorkingStationServices,
  createWorkingStation,
  editWorkingStation,
  getAllWorkingStations, getServicesOfWorkingStation
} from "../controllers/salonAdminWorkingStationRelatedController.js";


const router = express.Router();

// Update salon fields - can't update is_approve field using that
router.put('/update', requireAuth, updateSalonDetails);
//  Get details about salon
router.get('/my', requireAuth, getSalonDetailsController);



// 2.Banner Image management

// Add banner image


// Get banner images
router.get('/images', requireAuth, getBannerImages);

router.post('/images', requireAuth, addBannerImage);
// Delete banner image
router.delete('/images/:imageId', requireAuth, deleteBannerImage);
// Update banner image
router.put('/images/:imageId', requireAuth, updateBannerImage);



// 3.Stylist management

//Get all Stylist
router.get("/stylists", requireAuth, getAllStylists);
// Add stylist
router.post('/stylist', requireAuth, addStylist);
// Delete stylist
router.delete('/stylist/:stylist_id', requireAuth, deleteStylist);

router.put('/stylist/:stylist_id', requireAuth, updateStylist);

// Update stylist name
router.put('/stylist/:stylist_id/name', requireAuth, updateStylistName);
// Update stylist contact number
router.put('/stylist/:stylist_id/contact', requireAuth, updateStylistContact);
// Update profile picture
router.put('/stylist/:stylist_id/profile-picture', requireAuth, updateStylistProfilePic);
// Delete profile picture
router.delete('/stylist/:stylist_id/profile-picture', requireAuth, deleteStylistProfilePic);
// Update bio
router.put('/stylist/:stylist_id/bio', requireAuth, updateStylistBio);
// Delete bio
router.delete('/stylist/:stylist_id/bio', requireAuth, deleteStylistBio);
// Add service to a stylist
router.post('/stylist/services', requireAuth, addServicesToStylist);
// Remove service from stylist
router.post('/stylist/:stylist_id/services', requireAuth, deleteServicesFromStylist);
// Get all services of a stylist
router.get('/stylist/:stylist_id/services', requireAuth, getServicesOfStylist);




// 4. Service management



router.get('/services', requireAuth, getAllServices);
// Add new service to the salon
router.post('/services', requireAuth, addService);
// Delete a specific service by ID
// router.delete('/service/:serviceId',  requireAuth, deleteService);
// Update price of a specific service
router.put('/services/:serviceId/price', requireAuth, updateServicePrice);
// Update duration of a specific service
router.put('/services/:serviceId/duration', requireAuth, updateServiceDuration);
router.put('/services/:serviceId', requireAuth, updateService);



// 4. Schedule management

// Get all stylists in the salon (Only accessible by salon admin)
// router.get('/schedule', requireAuth, getAllStylistsForSalon);
// // Toggle stylist active status (Only accessible by salon admin)
// router.put('/schedule/status/:stylistId', requireAuth, toggleStylistActiveStatus);
// // Add work schedule for a stylist (POST)
// router.post('/schedule', requireAuth, addStylistSchedule);
// // Update work schedule for a stylist (PUT)
// router.put('/schedule/:scheduleId', requireAuth, updateStylistSchedule);
//


//new

// Get all stylists and their schedules for a salon
router.get("/schedule/stylists", requireAuth, getAllStylistsWithSchedule);
// Add a new schedule for a stylist
router.post("/schedule/stylists/:stylistId", requireAuth, addStylistSchedule);
// // Update an existing stylist schedule
router.put("/schedule/stylists/:stylistId/:scheduleId", requireAuth, updateStylistSchedule);
// // Toggle stylist active status
router.put('/schedule/stylists/:stylistId/status', requireAuth, toggleStylistActiveStatus);
// // Add a leave for a stylist
router.post("/schedule/stylists/:stylistId/leave", requireAuth, addStylistLeave);
//Edit leave for a stylist
router.put("/schedule/stylists/:stylistId/leave/:leaveId", requireAuth, editStylistLeave);
//Delete leave for a stylist
router.delete("/schedule/stylists/:stylistId/leave/:leaveId", requireAuth, deleteStylistLeave);
//Get all leaves for a stylist
router.get("/schedule/stylists/:stylistId/leaves", requireAuth, getAllLeavesForStylist);



// 5. Booking management
router.get("/booking", requireAuth, getAllBookings);
router.post("/booking", requireAuth, createBooking);
// Edit details of a booking only for that salon admin
router.put("/booking/:bookingId", requireAuth, updateBooking);
// Delete a booking only for that salon admin have access
router.delete("/booking/:bookingId", requireAuth, deleteBooking);

//new
//Booking for a stylist
router.get("/booking/stylist/:stylistId", requireAuth, getBookingsOfStylist);



// 6. Opening Hours management

router.get('/opening-hours', requireAuth, getOpeningHoursForSalon);
router.post('/opening-hours', requireAuth, updateOpeningHoursForWeek)


// 7. Working station management

// 1. Get all working stations in the salon
router.get('/working-stations', requireAuth, getAllWorkingStations);
// 2. Create a new working station
router.post('/working-stations', requireAuth, createWorkingStation);
// 3. Edit a working station
router.put('/working-stations', requireAuth, editWorkingStation);
// 4. Get all services of a specific working station
router.get('/working-stations/:station_id/services', requireAuth, getServicesOfWorkingStation);
// 5. Add or edit services for a working station
router.post('/working-stations/services', requireAuth, addOrEditWorkingStationServices);



export default router;
