const mongoose = require("mongoose");
const Review = require("./reviewModel");
const User = require("./userModel");

//create schema
const produceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "The produce post needs a title"],
  },
  price: {
    type: Number,
    required: [true, "The produce must have a price"],
    default: 0,
  },
  description: {
    type: String,
    required: [true, "The produce must have a description"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  image: [String],
  imageCover: {
    type: String,
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
  },
  Quantity: {
    type: Number,
  },
  farmlocation: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
  },
  reviews: [{ type: mongoose.Schema.ObjectId, ref: Review }],
  user: [{ type: mongoose.Schema.ObjectId, ref: User }],
});

//this will populate the reviews eachtime we get a product and user who made the review each time get the product
produceSchema.pre(/^find/, function (next) {
  this.populate({
    path: "reviews",
    populate: {
      path: "user",
      model: "User",
    },
  });
  next();
});

const Produce = mongoose.model("Produce", produceSchema);

module.exports = Produce;
