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
  getToursWithin,
  getDistances,
  uploadTourImage,
  resizeTourImage,
} from '../controllers/toursController.js';
import routerReview from './reviewRouter.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();
// router.param('id', checkID);
router.use('/:tourId/reviews', routerReview);
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router.route('/tours-stats').get(getToursStat);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
// /tours-distance/233/center/-40,45/unit/mi
//api/v1/tours/tours-within/400/center/34.111745,-118.113491/unit/mi
router.route('/distances/:latlng/unit/:unit').get(getDistances);
router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTours);
router
  .route('/:id')
  .get(getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    uploadTourImage,
    resizeTourImage,
    updateTours,
  )
  .delete(protect, restrictTo('admin', 'lead-guide'), delTour);
//post /Tour/id/reviews
//get /Tour/id/reviews
//get /Tour/id/reviews/id
// router.route('/:tourId/reviews').post(protect, restrictTo('user'), newReview);
export default router;
