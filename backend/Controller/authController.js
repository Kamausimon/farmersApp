const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    res.status(201).json({
      status: "success",
      data: {
        newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if the email or password have been keyed in
    if (!email || !password) {
      return next(new AppError("please fill all the required fields", 404));
    }

    //requst mongoose to check for the user
    const user = await User.findOne({ email: email }).select("+password");

    //check if the details are correct using bcrypt compare
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("wrong email or password", 401));
    }

    //if everything is okay
    res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protectRoute = () => {};

exports.restrict = () => {};

exports.forgotPassword = () => {};

exports.updatePassword = () => {};
