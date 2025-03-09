import express from 'express';

import {
  getAllTours,
  addNewTour,
  getTour,
  updateTour,
  deleteTour,
  aiasTopTours,
  getTourStats,
  getMonthlyPlans,
} from '../controllers/tours.controller.js';

import {
  protectTourRoute,
  restrictTo,
} from '../controllers/auth.controller.js';

import { router as reviewRouter } from './review.route.js';

export const router = express.Router();

// router.param('id', checkIfValidId);

router.route('/top-5-cheap').get(aiasTopTours, getAllTours);

router.route('/getstats').get(getTourStats);

router
  .route('/topBusyMonth')
  .get(
    protectTourRoute,
    restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlans,
  );

router
  .route('/')
  .get(getAllTours)
  .post(protectTourRoute, restrictTo('admin', 'lead-guide'), addNewTour);

router
  .route('/:id')
  .get(getTour)
  .patch(protectTourRoute, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protectTourRoute, restrictTo('admin', 'lead-guide'), deleteTour);

//POST  /tour/{tourID}/reviews
//GET  /tour/{tourID}/reviews  -- Getting all reviews
//GET /tour/{tourID}/reviews/{reviewID} -- Getting an exact review

router.use('/:tourId/reviews', reviewRouter);
