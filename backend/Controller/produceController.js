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

exports.getOneProduce = async (req, res, next) => {
  try {
    const oneProduce = await Produce.findById(req.params.id);

    if (!oneProduce) {
      res.status(400).json({
        status: "fail",
        message: "cannot find produce with that Id",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        oneProduce,
      },
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
