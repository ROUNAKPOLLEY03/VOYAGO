import express from 'express';
import {
  protectTourRoute,
  restrictTo,
} from '../controllers/auth.controller.js';
import {
  accpetBooking,
  cancelBooking,
  getAllBookings,
  getCheckoutSession,
  rejectBooking,
} from '../controllers/booking.controller.js';
export const router = express.Router();

router.get('/checkout-session/:tourID', protectTourRoute, getCheckoutSession);

router.delete('/my-tours/:bookingID', protectTourRoute, cancelBooking);

router.get(
  '/all-bookings',
  protectTourRoute,
  restrictTo('admin'),
  getAllBookings,
);

router.patch(
  '/accpetBooking/:bookingID',
  protectTourRoute,
  restrictTo('admin'),
  accpetBooking,
);

router.patch(
  '/rejectBooking/:bookingID',
  protectTourRoute,
  restrictTo('admin'),
  rejectBooking,
);
