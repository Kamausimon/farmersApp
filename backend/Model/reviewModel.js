const mongoose = require("mongoose");
const Produce = require("./produceModel");
const User = require("./userModel");

const reviewSchema = new mongoose.Schema(
  {
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
    produce: {
      type: mongoose.Schema.ObjectId,
      ref: "Produce",
      required: [true, "review must belong to a product"],
    },
    //review must be connected to the user
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "review must belong to a user"],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name",
  }).populate({
    path: "produce",
    select: "title",
  });
  next();
});

reviewSchema.index({ produce: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
