import Tour from '../models/toursModel.js';
import User from '../models/usersModel.js';
import Booking from '../models/bookingModel.js';
import AppError from '../utils/appErrors.js';
export const getOverview = async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours ',
    tours,
  });
};

export const getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
export const getLoginForm = (req, res) => {
  res.status(200).render('login', { title: 'log into your account' });
};
export const getAccount = (req, res) => {
  res.status(200).render('account', { title: 'your account' });
};
export const getMyTours = async (req, res) => {
  try {
    //1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
    //2) find tours with the returned IDs
    const tourID = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourID } });
    res.status(200).render('overview', { title: 'My Tours', tours });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
export const updateUserData = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email,
      },
      {
        new: true,
        runValidator: true,
      },
    );
    res.status(200).render('account', {
      title: 'your account',
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
