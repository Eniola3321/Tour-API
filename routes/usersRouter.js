import express from 'express';
import {
  getAllUsers,
  getUser,
  updateMe,
  deleteMe,
  updateUser,
  deleteUser,
  getMe,
  uploadUserPhoto,
  resizeUserPhoto,
} from '../controllers/usersController.js';
import {
  signUp,
  login,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} from '../controllers/authController.js';
const router = express.Router();
router.route('/signup').post(signUp);
router.route('/login').post(login);
router.route('/forgetPassword').post(forgotPassword);
router.route('/resetPassword/:token').patch(resetPassword);
// Protect all routes after this middlewares
router.use(protect);
router.route('/updateMyPassword').patch(protect, updatePassword);
router.get('/me', getMe, getUser);
router.patch('/updateMe', uploadUserPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);
router.use(restrictTo('admin'));
router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
