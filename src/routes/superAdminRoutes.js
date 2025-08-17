import express from 'express';
import { requireAuth } from "../middlewares/authMiddleware.js";
import { requireSupperAdmin } from "../middlewares/requireSupperAdmin.js";
import {
  getCustomerCount,
  getSalonCount,
  getBookingCount,
  getAllUnapprovedSalons,
  getUnapprovedSalonsByName,
  getSalonBookings,

  // Users
  getAllusers,
  getUserById,
  updateUser,

  // Salons
  getAllSalons,
  getSalonById,
  getSalonsPerDay,
  updateSalon,
  updateSalonStatus,

  // Customers
  getAllCustomers,
  getAllBookingServices,
  getBookingServicesBySalonId,
  getBookingsPerDay,

} from "../controllers/superAdminController.js";

const router = express.Router();


router.use(requireAuth);
router.use(requireSupperAdmin);


router.get('/customer-count',  getCustomerCount);    //works
router.get('/salon-count', getSalonCount);          //works
router.get('/booking-count', getBookingCount);

router.get('/users', getAllusers);              //works

router.get('/users/:id', getUserById);  //works
router.put('/users/:id', updateUser); //works


router.get('/salons', getAllSalons);        //works
 //getAllUnapprovedSalons
router.get('/salons-unapproved', getAllUnapprovedSalons);
//getUnapprovedSalonsByName
router.get('/salons-unapproved-search', getUnapprovedSalonsByName);
router.get('/salons/:id', getSalonById);    //works
router.put('/salons/:id', updateSalon);       //works for all columns , but this api no need 
router.put('/salonsStatus/:id', updateSalonStatus); //works for only status column (verify, decline)

router.get('/salonsPerDay', getSalonsPerDay); //get number of salons  group by each day
router.get('/customersPerDay', getAllCustomers); //get all number of  customers for group by each day
router.get('/booking-services', getAllBookingServices);         //return all daily booked count


router.get('/booking/:salon_id', getSalonBookings);

router.get('/bookings/:salonId/services', getBookingServicesBySalonId);         // return start datetime, end datetime and booked at tieme of each salon

router.get("/bookings-per-day", getBookingsPerDay); // get bookings per day

export default router;