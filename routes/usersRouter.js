import express from 'express';
import {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
} from '../controllers/usersController.js';
import {
  signUp,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js';
const router = express.Router();
router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgetPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
router.route('/updateMyPassword').patch(protect, updatePassword);
router.route('updateMe').patch(protect, updateMe);
router.route('updateMe').delete(protect, deleteMe);

router.route('/').get(getAllUsers);

router.route('/:id').get(getUser);

export default router;
