import { catchAsync } from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';

export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndDelete(id);
    if (!doc) return next(new ApiError('No tour found with give ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new ApiError('No tour found with give ID', 404));
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });

export const getOne = (Model, populations) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = Model.findById(id);
    if (populations) query = query.populate(populations);
    const doc = await query;

    if (!doc) return next(new ApiError('No tour found with give ID', 404));

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

