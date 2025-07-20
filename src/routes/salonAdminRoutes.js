// change the salon name                -done
// change the salon description         -done
// change the salon logo                -done
// change the salon address             -done
// change the salon contact number      -done
// change the salon location
// change the salon opening hours and days
// add images to the salon gallery            -done
// delete images from the salon gallery       -done
// change salon one images from gallery       -done
// add services to the salon
// delete services from the salon
// change salon one service price
// change salon one service duration
// add a employee
// delete a employee
// change employee name
// change employee contact number
// change employee profile picture
// delete employee profile picture
// change employee bio
// delete employee bio
// change employee id number
// delete employee id number


import express from 'express';
import {
  updateSalonDetails,
  addBannerImage,
  deleteBannerImage,
  updateBannerImage
} from '../controllers/salonAdminController.js';

import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireSalonAdmin } from '../middlewares/roleAuthMidddleware.js';


const router = express.Router();

// Update salon fields - can't update is_approve field using that
router.put('/update', requireAuth, updateSalonDetails);

// Banner Image management
router.post('/images', requireAuth, addBannerImage);
router.delete('/images/:imageId',requireAuth, deleteBannerImage);
router.put('/images/:imageId',requireAuth, updateBannerImage);

export default router;
