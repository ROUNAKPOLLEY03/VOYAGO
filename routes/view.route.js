import express from 'express';
import {
  getOverview,
  getResetForm,
  logIn,
  getTours,
  getAccount,
  forgetPassword,
  resetPassword,
  getMyTours,
  showBillings,
} from '../controllers/view.controller.js';

import {
  isLoggedIn,
  protectTourRoute,
  restrictTo,
} from '../controllers/auth.controller.js';
// import { createBookingCheckout } from '../controllers/booking.controller.js';
import { getAllBooking } from '../controllers/view.controller.js';

export const router = express.Router();

//The response from the middleware  will serve to all the pug templates
router.get('/', isLoggedIn, getOverview);

router.get('/signup', getResetForm);

router.get('/resetPassword/:token', resetPassword);

router.get('/tour/:slug', isLoggedIn, getTours);

router.get('/login', isLoggedIn, logIn);

router.get('/me', protectTourRoute, getAccount);

router.get('/forgot-password', forgetPassword);

router.get('/my-tours', protectTourRoute, getMyTours);

router.get(
  '/admin/all-bookings',
  protectTourRoute,
  restrictTo('admin'),
  getAllBooking,
);

router.get('/billings', protectTourRoute, showBillings);
