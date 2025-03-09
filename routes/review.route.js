import express from 'express';
import {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} from '../controllers/review.controller.js';
import {
  protectTourRoute,
  restrictTo,
} from '../controllers/auth.controller.js';

export const router = express.Router({ mergeParams: true });

router.use(protectTourRoute);

router
  .route('/')
  .get(getAllReviews)
  .post(protectTourRoute, restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .get(getReview);
