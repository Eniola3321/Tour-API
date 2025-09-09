import { Model } from 'mongoose';
import AppError from '../utils/appErrors.js';
// import APIFeatures from '../utils/apiFeatures.js';

export const createOne = (Model) => async (req, res, next) => {
  try {
    /*const newTour = new Tour({});
        newTour.save();*/
    const newDoc = await Model.create(req.body);
    if (!newDoc) {
      return next(new AppError('No new document found ', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        tour: newDoc,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

export const updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

export const deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

/*
export const getAll = Model =>async (req, res) => {
  try {
  // To allow for nested Get reviews on tour (hack)
  let filter = {};
  if(req.params.body) filter = {tour: req.params.tourId};
    // BUILD QUERY //
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    //query.sort().select().skip().limit()
    // SEND RESPONSE //
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};


export const getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    console.log(req.params);
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No Tour found with that ID', 404));
    }
    //Tour.findOne({_id: req.params.id})
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};*/
