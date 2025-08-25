import express from 'express';
import {
  aliasTopTours,
  getAllTours,
  createTours,
  getTour,
  getToursStat,
  updateTours,
  delTour,
  getMonthlyPlan,
} from '../controllers/toursController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();
// router.param('id', checkID);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/tours-stats').get(getToursStat);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(protect, getAllTours).post(createTours);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTours)
  .delete(protect, restrictTo('admin', 'lead-guide'), delTour);

export default router;
