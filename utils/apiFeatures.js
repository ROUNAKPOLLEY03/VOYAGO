export const filter = (req, query) => {
  //Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields'];
  excludedFields.forEach((key) => delete queryObj[key]);
  //Advanced Filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  return query.find(JSON.parse(queryStr));
};

export const sort = (req, query) => {
  const sortBy = req.query?.sort?.split(',').join(' ');
  if (req.query.sort) return query.sort(sortBy);
  else return query.sort('-createdAt');
};

export const limitFields = (req, query) => {
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    return query.select(fields);
  } else {
    return query.select('-__v');
  }
};

export const pagination = (req, query, totalDocs) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 9;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const numTours = totalDocs;
    if (skip >= numTours) throw new Error("This page doesn't exist!");
  }
  return query.skip(skip).limit(limit);
};
