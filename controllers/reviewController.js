import Review from '../models/reviewModel.js';
import { deleteOne, updateOne } from './handlerFactory.js';
export const getAllReview = async (req, res) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const reviews = await Review.find(filter);
    res.status(200).json({
      status: 'success',
      result: reviews.length,
      data: { review: reviews },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

export const newReview = async (req, res) => {
  try {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReviews = await Review.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newReviews,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

export const getReview = async (req, res) => {
  try {
    const getReview = await Review.findById(req.params.id);
    res.status(200).json({ status: 'success', data: { getReview } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};
export const updateReview = updateOne(Review);
export const delReview = deleteOne(Review);
