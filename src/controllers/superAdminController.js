import {
    getTotalCustomerCount,
    getTotalSalonCount,
    getTotalBookingCount,

    fetchUnapprovedSalons,
    searchUnapprovedSalonsByName,
    fetchBookingsBySalonId,
    // Users
    fetchAllUsers,
    fetchUserById,
    updateUserService,
    // deleteUserService,

    // Salons
    fetchAllSalons,
    fetchSalonById,
    createSalonService,
    updateSalonService,
    updateSalonServiceStatus,
    deleteSalonService,
    approveSalonService,
    getSalonsPerDayServices,

    // Stylists
    fetchAllStylists,
    fetchStylistById,
    fetchStylistsBySalon,
    createStylistService,
    updateStylistService,
    deleteStylistService,

    // Services
    fetchAllServices,
    fetchServiceById,
    fetchServicesBySalon,
    createServiceService,
    updateServiceService,
    deleteServiceService,

    // Bookings
    fetchAllBookings,
    fetchBookingById,
    fetchBookingsByUser,
    fetchBookingsBySalon,
    fetchBookingsByStylist,
    updateBookingStatusService,
    deleteBookingService,
    getBookingsPerDayServices,

    // Customers
    fetchAllCustomers,
    fetchCustomerById,
    updateCustomerService,
    deleteCustomerService,

    // Work Schedules
    fetchAllWorkSchedules,
    fetchWorkScheduleById,
    fetchWorkSchedulesByStylist,
    createWorkScheduleService,
    updateWorkScheduleService,
    deleteWorkScheduleService,

    // Booking Services
    fetchAllBookingServices,
    // fetchBookingServicesByBooking,
    fetchBookingServicesBySalonId,
    updateBookingServiceService,
    deleteBookingServiceService2

} from '../services/superAdminService.js';

// User Controllers
export const getAllusers = async (req, res) => {
    try {
        const userData = await fetchAllUsers();
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await fetchUserById(id);
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await updateUserService(id, req.body);
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// export const deleteUser = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await deleteUserService(id);
//         res.status(200).json({ message: 'User deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };


export const getSalonsPerDay = async (req, res) => {
    try {
        const salonData = await getSalonsPerDayServices();
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingsPerDay = async (req, res) => {
    try {
        const bookings = await getBookingsPerDayServices();
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Salon Controllers
export const getAllSalons = async (req, res) => {
    try {
        const salonData = await fetchAllSalons();
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// get all UnapprovedSalons
export const getAllUnapprovedSalons = async (req, res) => {
    try {
        const salonData = await fetchUnapprovedSalons();
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//searchUnapprovedSalonsByName
export const getUnapprovedSalonsByName = async (req, res) => {
    const { name = '' } = req.query;

    try {
        const salons = await searchUnapprovedSalonsByName(name);
        res.status(200).json(salons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSalonById = async (req, res) => {
    try {
        const { id } = req.params;
        const salonData = await fetchSalonById(id);
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createSalon = async (req, res) => {
    try {
        const salonData = await createSalonService(req.body);
        res.status(201).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateSalon = async (req, res) => {
    try {
        const { id } = req.params;
        const salonData = await updateSalonService(id, req.body);
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateSalonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const salonData = await updateSalonServiceStatus(id, req.body);
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteSalon = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteSalonService(id);
        res.status(200).json({ message: 'Salon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const approveSalon = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_approved } = req.body;
        const salonData = await approveSalonService(id, is_approved);
        res.status(200).json(salonData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Stylist Controllers
export const getAllStylists = async (req, res) => {
    try {
        const stylistData = await fetchAllStylists();
        res.status(200).json(stylistData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const stylistData = await fetchStylistById(id);
        res.status(200).json(stylistData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getStylistsBySalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const stylistData = await fetchStylistsBySalon(salonId);
        res.status(200).json(stylistData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createStylist = async (req, res) => {
    try {
        const stylistData = await createStylistService(req.body);
        res.status(201).json(stylistData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateStylist = async (req, res) => {
    try {
        const { id } = req.params;
        const stylistData = await updateStylistService(id, req.body);
        res.status(200).json(stylistData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteStylist = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteStylistService(id);
        res.status(200).json({ message: 'Stylist deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Service Controllers
export const getAllServices = async (req, res) => {
    try {
        const serviceData = await fetchAllServices();
        res.status(200).json(serviceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const { serviceId, salonId } = req.params;
        const serviceData = await fetchServiceById(serviceId, salonId);
        res.status(200).json(serviceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getServicesBySalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const serviceData = await fetchServicesBySalon(salonId);
        res.status(200).json(serviceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createService = async (req, res) => {
    try {
        const serviceData = await createServiceService(req.body);
        res.status(201).json(serviceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const { serviceId, salonId } = req.params;
        const serviceData = await updateServiceService(serviceId, salonId, req.body);
        res.status(200).json(serviceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { serviceId, salonId } = req.params;
        await deleteServiceService(serviceId, salonId);
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Booking Controllers
export const getAllBookings = async (req, res) => {
    try {
        const bookingData = await fetchAllBookings();
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingData = await fetchBookingById(id);
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingsByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const bookingData = await fetchBookingsByUser(userId);
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingsBySalon = async (req, res) => {
    try {
        const { salonId } = req.params;
        const bookingData = await fetchBookingsBySalon(salonId);
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingsByStylist = async (req, res) => {
    try {
        const { stylistId } = req.params;
        const bookingData = await fetchBookingsByStylist(stylistId);
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const bookingData = await updateBookingStatusService(id, status);
        res.status(200).json(bookingData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteBookingService(id);
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Customer Controllers
export const getAllCustomers = async (req, res) => {
    try {
        const customerData = await fetchAllCustomers();
        res.status(200).json(customerData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = await fetchCustomerById(id);
        res.status(200).json(customerData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customerData = await updateCustomerService(id, req.body);
        res.status(200).json(customerData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteCustomerService(id);
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Work Schedule Controllers
export const getAllWorkSchedules = async (req, res) => {
    try {
        const scheduleData = await fetchAllWorkSchedules();
        res.status(200).json(scheduleData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getWorkScheduleById = async (req, res) => {
    try {
        const { id } = req.params;
        const scheduleData = await fetchWorkScheduleById(id);
        res.status(200).json(scheduleData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getWorkSchedulesByStylist = async (req, res) => {
    try {
        const { stylistId } = req.params;
        const scheduleData = await fetchWorkSchedulesByStylist(stylistId);
        res.status(200).json(scheduleData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createWorkSchedule = async (req, res) => {
    try {
        const scheduleData = await createWorkScheduleService(req.body);
        res.status(201).json(scheduleData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateWorkSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const scheduleData = await updateWorkScheduleService(id, req.body);
        res.status(200).json(scheduleData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteWorkSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteWorkScheduleService(id);
        res.status(200).json({ message: 'Work schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Booking Services Controllers
export const getAllBookingServices = async (req, res) => {
    try {
        const bookingServiceData = await fetchAllBookingServices();
        res.status(200).json(bookingServiceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingServicesBySalonId = async (req, res) => {
    try {
        const { salonId } = req.params;
        const bookingServiceData = await fetchBookingServicesBySalonId(salonId);
        res.status(200).json(bookingServiceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateBookingService = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingServiceData = await updateBookingServiceService(id, req.body);
        res.status(200).json(bookingServiceData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteBookingServiceController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteBookingServiceService2(id);
        res.status(200).json({ message: 'Booking service deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getCustomerCount = async (req, res) => {
    try {
        const count = await getTotalCustomerCount();
        res.status(200).json({ total_customers: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getSalonCount = async (req, res) => {
    try {
        const count = await getTotalSalonCount();
        res.status(200).json({ total_salons: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBookingCount = async (req, res) => {
    try {
        const count = await getTotalBookingCount();
        res.status(200).json({ total_bookings: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//fetchBookingsBySalonId
export const getSalonBookings = async (req, res) => {
    const { salon_id } = req.params;

    try {
        const bookings = await fetchBookingsBySalonId(salon_id);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


