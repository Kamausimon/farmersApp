//middlewares for our routes
const Produce = require("../Model/produceModel");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllProduce = async (req, res, next) => {
  try {
    //execute the query
    let query = Produce.find();

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const produces = await features.query;

    //semd response
    res.status(200).json({
      status: "success",
      data: {
        produces,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.messagge,
    });
  }
};

exports.createNewProduce = async (req, res, next) => {
  try {
    const newProduce = await Produce.create(req.body);

    res.status(201).json({
      status: "success",
      data: {
        newProduce,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

//this returns a single produce plus the reviews
exports.getOneProduce = async (req, res, next) => {
  try {
    const oneProduce = await Produce.findById(req.params.id).populate({
      path: "review",
      select: "review user produce createdAt",
    });

    if (!oneProduce) {
      res.status(400).json({
        status: "fail",
        message: "cannot find produce with that Id",
      });
    }

    res.status(200).json({
      status: "success",
      oneProduce,
      review: oneProduce.review,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateOneProduce = async (req, res, next) => {
  try {
    const updateProduce = await Produce.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updateProduce) {
      // If no produce item is found with the specified ID, return a 404 error
      return res.status(404).json({
        status: "fail",
        message: "Produce not found",
      });
    }

    // If the produce item is successfully updated, send a success response with the updated produce data
    res.status(200).json({
      status: "success",
      data: {
        produce: updateProduce,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.deleteProduce = async (req, res, next) => {
  try {
    const deleteProduce = await Produce.findByIdAndDelete(req.params.id);

    //if id isnt found
    if (!deleteProduce) {
      return res.status(404).json({
        status: "fail",
        message: "Produce not found",
      });
    }

    //if successfully deleted
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.produceOwnershipConfirmation = async (req, res, next) => {
  try {
    const { id } = req.params;

    //find the produce
    const produce = Produce.findById(id);
    //check if the produce's user id matches the person making the request and if not say they are not allowed
    if (produce.user.toString() !== req.user._id.toString()) {
      next(new AppError("You are not authorized to make this request", 400));
    }
    //if matching allow to the next middleware
    next();
  } catch (err) {
    console.log("Error making the requested changes");
    next(new AppError("An error occurred while making the update", 500));
  }
};
