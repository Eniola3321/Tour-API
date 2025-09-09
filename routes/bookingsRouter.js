import express from 'express';
import {
  createBooking,
  delBooking,
  getAllBooking,
  getBooking,
  getCheckoutSession,
  updateBooking,
} from '../controllers/bookingsController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();
router.use(protect);
router.get('/checkout-session/:tourId', getCheckoutSession);
router.use(restrictTo('admin', 'lead-guide'));
router.route('/').get(getAllBooking).post(createBooking);
router.route('/:id').get(getBooking).patch(updateBooking).delete(delBooking);
export default router;
