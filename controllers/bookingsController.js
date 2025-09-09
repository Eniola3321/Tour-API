import Stripe from 'stripe';
import Booking from '../models/bookingModel.js';
import Tour from '../models/toursModel.js';
import { createOne, deleteOne, updateOne } from './handlerFactory.js';
// import Booking from '../models/bookingsModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = async (req, res, next) => {
  try {
    //1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    //2) create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://natours.dev/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
    });
    //3) create session as response
    res.status(200).json({ status: 'success', session });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
// we use this when our credit is successfully charged
export const createBookingCheckout = async (req, res, next) => {
  // This is only temporary, because it's unsecure: everyone can make bookings without paying
  try {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });
    res.redirect(req.originalUrl.split('?')[0]);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const createBooking = createOne(Booking);
export const getAllBooking = async (req, res) => {
  try {
    const getAllbooking = await Booking.find();
    res.status(200).json({
      status: 'success',
      data: {
        book: getAllBooking,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    const getBooking = await Booking.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        getBooking,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
export const updateBooking = updateOne(Booking);
export const delBooking = deleteOne(Booking);
