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
    // deleteUser,

    // Salons
    getAllSalons,
    getSalonById,
    createSalon,
    getSalonsPerDay,
    updateSalon,
    updateSalonStatus,
    deleteSalon,
    approveSalon,

    // Stylists
    getAllStylists,
    getStylistById,
    getStylistsBySalon,
    createStylist,
    updateStylist,
    deleteStylist,

    // Services
    getAllServices,
    getServiceById,
    getServicesBySalon,
    createService,
    updateService,
    deleteService,

    // Bookings
    getAllBookings,
    getBookingById,
    getBookingsByUser,
    getBookingsBySalon,
    getBookingsByStylist,
    updateBookingStatus,
    deleteBooking,

    // Customers
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,

    // Stylist Work Schedules
    getAllWorkSchedules,
    getWorkScheduleById,
    getWorkSchedulesByStylist,
    createWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,

    // Booking Services
    getAllBookingServices,
    // getBookingServicesByBooking,
    getBookingServicesBySalonId,
    updateBookingService,
    deleteBookingServiceController,
} from '../controllers/superAdminController.js';

const router = express.Router();

// Apply auth and super admin middleware to all routes
router.use(requireAuth);
router.use(requireSupperAdmin);

// User routes
  //works , When use put , need to pass row data through body 
// router.delete('/users/:id', deleteUser);     we dont delete any use, but we can disable the user by updating the status to inactive

// Salon routes

// router.post('/salons', createSalon);        


// router.delete('/salons/:id', deleteSalon);
// router.put('/salons/:id/approve', approveSalon);     we can do this by above put method 

// Stylist routes
// router.get('/stylists', getAllStylists);
// router.get('/stylists/:id', getStylistById);
// router.get('/salons/:salonId/stylists', getStylistsBySalon);
// router.post('/stylists', createStylist);
// router.put('/stylists/:id', updateStylist);
// router.delete('/stylists/:id', deleteStylist);

// Service routes
// router.get('/services', getAllServices);
// router.get('/services/:serviceId/:salonId', getServiceById);
// router.get('/salons/:salonId/services', getServicesBySalon);
// router.post('/services', createService);
// router.put('/services/:serviceId/:salonId', updateService);
// router.delete('/services/:serviceId/:salonId', deleteService);

// Booking routes
// router.get('/bookings', getAllBookings);
// router.get('/bookings/:id', getBookingById);
// router.get('/users/:userId/bookings', getBookingsByUser);
// router.get('/salons/:salonId/bookings', getBookingsBySalon);
// router.get('/stylists/:stylistId/bookings', getBookingsByStylist);
// router.put('/bookings/:id/status', updateBookingStatus);
// router.delete('/bookings/:id', deleteBooking);

// Customer routes

// router.get('/customers/:id', getCustomerById);
// router.put('/customers/:id', updateCustomer);
// router.delete('/customers/:id', deleteCustomer);


// Work schedule routes
// router.get('/work-schedules', getAllWorkSchedules);
// router.get('/work-schedules/:id', getWorkScheduleById);
// router.get('/stylists/:stylistId/work-schedules', getWorkSchedulesByStylist);
// router.post('/work-schedules', createWorkSchedule);
// router.put('/work-schedules/:id', updateWorkSchedule);
// router.delete('/work-schedules/:id', deleteWorkSchedule);

// Booking services routes

// router.put('/booking-services/:id', updateBookingService);
// router.delete('/booking-services/:id', deleteBookingServiceController);
//  getCustomerCount,
//     getSalonCount,

router.get('/customer-count', getCustomerCount);    //works
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





//others also works, but no need that mutch of things for supper admins .
export default router;