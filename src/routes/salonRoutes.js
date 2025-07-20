import express from 'express';
import {
  getAllSalons,
  getSalonById,
  getSalonsByLocation,
  getSalonsByName,
  getSalonsByServiceType,
  getSalonsByType,
  getStylistsBySalonId,
  getAvailableTimeSlots
} from '../controllers/salonController.js';

const router = express.Router();

router.get('/', getAllSalons); // Fetch all salons
router.get('/:id', getSalonById);   // Fetch salon by ID http://localhost:3000/api/salons/c49cf780-e2db-4a94-b1f2-bf2aa47f785b
router.get('/location', getSalonsByLocation);   //not working
router.get('/name/:name', getSalonsByName); // http://localhost:3000/api/salons/name/Sithum
// router.get('/type/service/:serviceType', getSalonsByServiceType);


router.get('/type/:id', getSalonsByType);       //http://localhost:3000/api/salons/type/2da738de-ab0e-4cc5-9e5a-a4bfcbb43dc0

router.get('/:id/stylists', getStylistsBySalonId);      //http://localhost:3000/api/salons/2da738de-ab0e-4cc5-9e5a-a4bfcbb43dc0/stylists

router.get('/stylist/:stylistId/availability', getAvailableTimeSlots);  //http://localhost:3000/api/salons/stylist/b5991531-a0e1-460e-bce9-3dee1056d3b6/availability

export default router;
