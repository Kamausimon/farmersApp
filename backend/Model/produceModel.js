const mongoose = require("mongoose");

// Define the schema
const produceSchema = new mongoose.Schema(
  {
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
        type: String,
        enum: ["Point"],
      },
    },
    Quantity: {
      type: Number,
    },
    farmlocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
    },
  },
  // Define the virtuals
  {
    /*  toJSON: { virtuals: true },
    toObject: { virtuals: true }, */
    virtuals: {
      review: {
        options: {
          ref: "Review",
          localField: "_id",
          foreignField: "produce",
          justOne: true,
        },
      },
    },
  }
);

// Create the model
const Produce = mongoose.model("Produce", produceSchema);

// Export the model
module.exports = Produce;
