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
    console.log();
  }
};

exports.getOneReview = () => {};

exports.updateReview = () => {};

exports.deleteReview = () => {};
