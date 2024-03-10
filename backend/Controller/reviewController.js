const Review = require("../Model/reviewModel");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const mongoose = require("mongoose");

exports.setProduceUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.produce) req.body.produce = req.params.produceId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.produceId) filter = { tour: req.params.produceId };

    const features = new APIFeatures(Review.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const reviews = await features.query;

    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
  } catch (err) {
    console.error("Error fetching the reviews:", err);
    next(new AppError("Error fetching the reviews", 500));
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const review = await Review.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (err) {
    console.log("cannot create the review", err);
    next(new AppError("There was an error while creating the review", 404));
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (err) {
    console.log("there was an error updating the review");
    next(new AppError("There was an error updating the review", 404));
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log("There was an error deleting the review");
    next(new AppError("There was an error deleting ", 400));
  }
};
