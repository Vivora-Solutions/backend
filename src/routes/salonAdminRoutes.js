// change the salon name                -done
// change the salon description         -done
// change the salon logo                -done
// change the salon address             -done
// change the salon contact number      -done
// change the salon location
// change the salon opening hours and days

// add images to the salon gallery             -done
// delete images from the salon gallery        -done
// change salon one images from gallery        -done
// add services to the salon                   -done
// delete services from the salon              -done
// change salon one service price              -done
// change salon one service duration           -done
// add a stylist                               -done
// delete a stylist                            -done  
// change stylist name                         -done 
// change stylist contact number               -done
// change stylist profile picture              -done
// delete stylist profile picture              -done
// change stylist bio                          -done
// delete stylist bio                          -done
// get all stylists in a salon_for that salon_admin                               -done   
// change statsus of is_active (bool value) only for salon_admins can do it       -done
// according to day salon admins can add start time daily and end time daily (day can be also change by salon admin) for this we want a post method and put method



import express from 'express';
import {
  updateSalonDetails,
  addBannerImage,
  deleteBannerImage,
  updateBannerImage

} from '../controllers/salonAdminBasicController.js';


import {
  addStylist,
  deleteStylist,
  updateStylistName,
  updateStylistContact,
  updateStylistProfilePic,
  deleteStylistProfilePic,
  updateStylistBio,
  deleteStylistBio,
} from '../controllers/salonAdminStylistRelatedController.js';

import {
  addService,
  deleteService,
  updateServicePrice,
  updateServiceDuration
} from '../controllers/salonAdminServiceRelatedController.js';

import {
  getAllStylistsForSalon,
  toggleStylistActiveStatus,
  addStylistSchedule,
  updateStylistSchedule
} from '../controllers/salonAdminscheduleRelatedController.js';

import { requireAuth } from '../middlewares/authMiddleware.js';
//import { requireSalonAdmin } from '../middlewares/roleAuthMidddleware.js';



const router = express.Router();

// 1.Update salon fields - can't update is_approve field using that
router.put('/update', requireAuth, updateSalonDetails);


// 2.Banner Image management

// Add banner image
router.post('/images', requireAuth, addBannerImage);
// Delete banner image
router.delete('/images/:imageId',requireAuth, deleteBannerImage);
// Update banner image
router.put('/images/:imageId',requireAuth, updateBannerImage);



// 3.Stylist management

// Add stylist
router.post('/stylist', requireAuth, addStylist);
// Delete stylist
router.delete('/stylist/:stylist_id', requireAuth, deleteStylist);
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



// 4. Service management

// Add new service to the salon
router.post('/service',requireAuth, addService);
// Delete a specific service by ID
router.delete('/service/:serviceId',  requireAuth, deleteService);
// Update price of a specific service
router.put('/service/:serviceId/price', requireAuth, updateServicePrice);
// Update duration of a specific service
router.put('/service/:serviceId/duration',  requireAuth, updateServiceDuration);




// 4. Schedule management

// Get all stylists in the salon (Only accessible by salon admin)
router.get('/schedule', requireAuth, getAllStylistsForSalon);
// Toggle stylist active status (Only accessible by salon admin)
router.put('/schedule/status/:stylistId', requireAuth, toggleStylistActiveStatus);
// Add work schedule for a stylist (POST)
router.post('/schedule', requireAuth, addStylistSchedule);
// Update work schedule for a stylist (PUT)
router.put('/schedule/:scheduleId', requireAuth, updateStylistSchedule);


export default router;
