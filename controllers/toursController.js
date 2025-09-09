import multer from 'multer';
import sharp from 'sharp';
import Tour from '../models/toursModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appErrors.js';
import {
  createOne,
  deleteOne,
  updateOne,
} from '../controllers/handlerFactory.js';
// import catchAsync from '../utils/catchAsync.js';

const multerStorage = multer.memoryStorage(); // image will be store as a buffer;

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// const upload = multer({ dest: 'public/img/users' });
export const uploadTourImage = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
export const resizeTourImage = async (req, res, next) => {
  try {
    // console.log(req.files);
    if (!req.files.imageCover || !req.files.images) return next();
    //1) Cover Image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg `;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
    //2) Images
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg `;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }),
    );
    next();
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
  next();
};
export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage, price';
  req.query.fields = 'name, price, ratingAverage, summary, difficulty';
  next();
};

export const getAllTours = async (req, res) => {
  try {
    // BUILD QUERY //
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    //query.sort().select().skip().limit()
    // SEND RESPONSE //
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

export const createTours = createOne(Tour);
export const getTour = async (req, res, next) => {
  try {
    console.log(req.params);
    const tour = await Tour.findById(req.params.id).populate('review');
    if (!tour) {
      return next(new AppError('No Tour found with that ID', 404));
    }
    //Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
export const getToursStat = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: null,
          // _id: '$difficulty',
          // _id: '$ratingsAverage',
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRatings: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
export const getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            // $ite: new Date(`${year}-10-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStart: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numTourStart: -1,
        },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
export const updateTours = updateOne(Tour);
export const delTour = deleteOne(Tour);

//'/tours-within/:distance/center/:latlng/unit/:unit',
// /tours-distance/233/center/34.111745, -118.113491/unit/mi
export const getToursWithin = async (req, res, next) => {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
      return next(
        new AppError(
          'please provide latitude and longitude in the format lat, lng.',
        ),
        400,
      );
    }
    // console.log(distance, center, lat, lng, unit);
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { data: tours },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
export const getDistances = async (req, res, next) => {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
      return next(
        new AppError(
          'please provide latitude and longitude in the format lat, lng.',
        ),
        400,
      );
    }
    const distance = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: { data: distance },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
/*
export const createTours = async (req, res) => {
  try {
    /*const newTour = new Tour({});
    newTour.save(); 
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
export const updateTours = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

export const delTour = async (req, res, next) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    // if (!tour) {
    //   return next(new AppError('No Tour found with that ID', 404));
    // }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
export const getAllTours = async (req, res) => {
  try {
    // BUILD QUERY //
    //1a) Filtering
    const queryObj = { ...req.query };
    const excludedField = ['sort', 'limit', 'page', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    console.log(req.query, queryObj);
    // EXECUTE THE QUERY //
    // Two ways of Writing A Query//

    //i) const query =  Tour.find({ duration: 5, difficulty: 'easy' });
    //ii) const query =  Tour.find().where('duration') .equals(5).where('difficulty').equals('easy');
    //1b) Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(it| ite| gt| gte)\b/g,
      (match) => `$${match}`,
    );
    let query = Tour.find(JSON.parse(queryStr));
    //2) Sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort);
      // const sortBy = req.query.sort(",").join("");
      // console.log(sortBy)
      //sort('price,ratingsAverage');
    } else {
      query = query.sort('-createdAt');
    }

    //3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    //4) Pagination
    const page = req.query.page * 1 || 1; // default value
    const limit = req.query.limit * 1 || 1;
    const skip = (page - 1) * limit;
    //page=2&limit=10, skip 1-10 result from page1, start from 11-20, page2,
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const newTours = await Tour.countDocuments();
      if (skip >= newTours) throw new Error('This page does not exist');
    }
    const tours = await query;
    //query.sort().select().skip().limit()
    // SEND RESPONSE //
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};*/
/*export const getAllTours = async (req, res) => {
  try {
    // 1a) Basic Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['sort', 'limit', 'page', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1b) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Execute Query
    const tours = await query;

    // 5) Send Response
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: { tours },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
*/
/*import fs from 'fs';

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8'),
);
export const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'sucess',
    requestAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};
export const createTours = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ newID }, req.body);
  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours), 
      res.status(201).json({
        status: 'sucess',
        data: {
          tour: newTour,
        },
      });
    },
  );
};
export const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  // if (!tour) {

  res.status(200).json({
    status: 'sucess',
    data: {
      tour: tour,
    },
  });
};
export const checkID = (req, res, next, val) => {
  console.log(`Tour ID is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({ status: 'fail', msg: 'Invalid Tour' });
  }
  next();
};
export const checkBody = (req, res, next) => {
  if (!req.body.name || req.body.price) {
    return res
      .status(400)
      .json({ status: 'fail', msg: 'missing name or price' });
  }
  next();
};
export const updateTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '< Updated tour here... >',
    },
  });
};
*/
