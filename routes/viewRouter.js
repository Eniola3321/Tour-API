import express from 'express';
import { isLoggedIn, protect } from '../controllers/authController.js';
import { createBookingCheckout } from '../controllers/bookingsController.js';
import {
  getOverview,
  getTour,
  getLoginForm,
  getMyTours,
  getAccount,
  updateUserData,
} from '../controllers/viewsController.js';
const router = express.Router();
// pug route handler
router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);
router.get('/me', protect, getAccount);
router.get('/my-tours', protect, getMyTours);
router.post('/submit-user-data', protect, updateUserData);
export default router;
