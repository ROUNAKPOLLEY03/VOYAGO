import { Tour } from '../models/tour.model.js';

import { filter, sort, limitFields, pagination } from '../utils/apiFeatures.js';
import { catchAsync } from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import { createOne, deleteOne, getOne, updateOne } from './handlerFactory.js';

export const aiasTopTours = async (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = '5';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

export const getAllTours = catchAsync(async (req, res, next) => {
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


  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

//export const catchAsync = (fn) => (req, res, next) =>
//  Promise.resolve(fn(req, res, next)).catch(next);
export const addNewTour = createOne(Tour);

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);

export const getTour = getOne(Tour, { path: 'reviews' });

export const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numOfTours: {
          $sum: 1,
        },
        numRatings: {
          $sum: '$ratingsQuantity',
        },
        avgRating: {
          $avg: '$ratingsAverage',
        },
        avgPrice: {
          $avg: '$price',
        },
        minPrice: {
          $min: '$price',
        },
        maxPrice: {
          $max: '$price',
        },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlans = catchAsync(async (req, res, next) => {
  const year = +req.query.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numOfTours: {
          $sum: 1,
        },
        tours: {
          $push: '$name',
        },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numOfTours: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
