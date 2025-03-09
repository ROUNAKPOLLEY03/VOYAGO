import { Review } from '../models/review.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createOne, deleteOne, getOne, updateOne } from './handlerFactory.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find(
    req.params.tourId ? { tour: req.params.tourId } : {},
  );

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const createReview = createOne(Review);

export const deleteReview = deleteOne(Review);

export const updateReview = updateOne(Review);

export const getReview = getOne(Review);
