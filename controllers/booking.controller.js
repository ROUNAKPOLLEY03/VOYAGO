import Stripe from 'stripe';
import { Tour } from '../models/tour.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { Booking } from '../models/booking.model.js';
import ApiError from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { Email } from '../utils/email.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  const user = await User.findById(req.user.id);

  const booked = await Booking.findOne({ tour, user });
  if (booked) return next(new ApiError('Tour is already booked', 409));

  //2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'inr',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });
  //3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying money
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

export const cancelBooking = catchAsync(async (req, res, next) => {
  const { bookingID } = req.params;

  const booking = await Booking.deleteOne({ _id: bookingID });
  if (!booking) return next(new ApiError('Tour not found', 404));
  res.status(200).json({
    status: 'success',
    message: 'Booking successfully canceled',
  });
});

export const getAllBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find();
  res.status(200).json({
    status: 'success',
    bookings,
  });
});

export const accpetBooking = catchAsync(async (req, res, next) => {
  const { bookingID } = req.params;

  const booking = await Booking.findById(bookingID);
  booking.status = 'confirm';
  await booking.save();
  const url = `${req.protocol}://${req.get('host')}/my-tours`;
  await new Email(booking.user, url).sendConfirmation();
  res.status(200).json({
    status: 'success',
    booking,
  });
});

export const rejectBooking = catchAsync(async (req, res, next) => {
  const { bookingID } = req.params;

  const booking = await Booking.findById(bookingID);
  booking.status = 'cancelled';
  await booking.save();
  res.status(200).json({
    status: 'success',
    booking,
  });
});


