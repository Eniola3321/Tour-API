import express from 'express';
import {
  getAllReview,
  newReview,
  getReview,
  delReview,
  updateReview,
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../controllers/authController.js';
const router = express.Router({ mergeParams: true });
router.use(protect);
router.route('/').get(getAllReview).post(restrictTo('user'), newReview);
router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), delReview);
export default router;
