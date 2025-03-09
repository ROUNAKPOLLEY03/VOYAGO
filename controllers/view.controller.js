import { Booking } from '../models/booking.model.js';
import { Tour } from '../models/tour.model.js';
// import { getAllBookings } from '../public/js/getAllBookings(admin).js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { filter, sort, limitFields, pagination } from '../utils/apiFeatures.js';

export const getOverview = catchAsync(async (req, res, next) => {
  let query = Tour.find();
  //filtering
  query = filter(req, query);
  //sorting
  query = sort(req, query);
  //limiting the fields: projecting
  query = limitFields(req, query);
  //Pagination
  const totalDocs = await Tour.countDocuments();
  query = pagination(req, query, totalDocs);
  const tours = await query;

  res.status(200).render('overview', {
    tours,
  });
});

export const getTours = catchAsync(async (req, res, next) => {
  //1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    return next(new ApiError('There is no tour with this name.', 404));
  }
  //2) Build template
  //3) Render template using data from 1
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
    tour,
  });
});

export const logIn = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

export const getAccount = (req, res) => {
  res.status(200).render('account'),
    {
      title: 'Your account',
    };
};

export const getResetForm = (req, res) => {
  res.status(200).render('signup');
};

export const forgetPassword = (req, res) => {
  res.status(200).render('forgotPassword');
};

export const resetPassword = (req, res) => {
  res.status(200).render('resetPassword');
};

export const getMyTours = catchAsync(async (req, res, next) => {
  //1) Find all the bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2) Find all the tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('booking', {
    title: 'My Tours',
    bookings,
  });
});

export const getAllBooking = catchAsync(async (req, res, next) => {
  //1) Find all the bookings
  const bookings = await Booking.find({ status: 'Pending' });
  //2) Find all the tours with the returned IDs
  res.status(200).render('allBookings(admin)', {
    title: 'All Bookings',
    bookings,
  });
});

export const showBillings = catchAsync(async (req, res, next) => {
  //1) Find all the bookings
  const bookings = await Booking.find({ user: req.user.id });
  //2) Find all the tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('billings', {
    title: 'My Tours',
    bookings,
  });
});