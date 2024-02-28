const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review: {
    type: "String",
    required: [true, "Provide a review on the product"],
  },
  rating: {
    type: "Number",
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  //review must be connected to the product
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: [true, "review must belong to a product"],
  },
  //review must be connected to the user
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "review must belong to a user"],
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
