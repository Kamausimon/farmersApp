const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");

//create a jtw sign token
exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//create  a jwt sending function
const createSendToken = (user, statusCode, res) => {
  //jwt token as per the generated jwt
  const token = signToken(user._id);

  //define options for the cookie
  const cookieOptions = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
    ),
    httpOnly: true,
  };

  //set cookie options to secure in production
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  //set the cookie in a cookie named jtw
  res.cookie("jwt", token, cookieOptions);

  //remove the password from the response to prevent it from becoming exposed
  user.password = undefined;

  //send the response alongside the token
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

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
