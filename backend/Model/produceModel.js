const mongoose = require("mongoose");

//create schema
const produceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "The produce post needs a title"],
  },
  price: {
    type: Number,
    required: [true, "The produce must have a price"],
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
});

const Produce = mongoose.model("Produce", produceSchema);

module.exports = Produce;
