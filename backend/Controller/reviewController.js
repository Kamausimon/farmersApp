const Review = require("../Model/reviewModel");
const AppError = require("../utils/AppError");

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = async (req, res, next) => {
  try {
    const { produceId } = req.params;

    //find the reviews by that id
    const reviews = await Review.find({ produce: produceId });

    //if the length of the returned query or none is found return an empty array
    if (!reviews || reviews.length === 0) {
      req.reviews = [];
      return next();
    }

    //if present
    req.reviews = reviews;
    res.status(200).json({
      status: "success",
      data: {
        reviews,
      },
    });
    next();
  } catch (err) {
    console.log("There was an error fetching the reviews");
    next(new AppError("Error fetching the reviews", 404));
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
    console.log("cannot create the review");
    next(new AppError("There was an error while creating the review", 404));
  }
};

exports.getOneReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    res.status(201).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (err) {
    console.log("cannot get the review");
    next(new AppError("There was an error getting the review", 400));
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
