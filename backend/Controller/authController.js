const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const crypto = require("crypto-js");
const jwt = require("jsonwebtoken");
const { promisfy } = require("util");
const sendmail = require("../utils/sendEmail");

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

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 201, res);
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.protectRoute = async (req, res, next) => {
  //confirm that the token is present
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("you are not logged in, Kindly login to access", 401)
    );
  }

  //verify the token
  const decoded = await promisfy(jwt.verify)(token, process.env.JWT_SECRET);

  //check if the user making the request exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("The user does not exist", 401));
  }

  //check if the user changed password after the token was used
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password please login again", 401)
    );
  }

  //if the current user is the true user allow access
  req.user = currentUser;
  next();
};

exports.restrictTo = (...roles) => {
  // restict routes based on the roles
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you are not authorized to access this", 404));
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  //check if there is a user with that email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 401));
  }

  //create the random password reset token
  const resetToken = createResetToken();
  await user.save({ validateBeforeSave: false });

  //send the token back as an email
  //3 send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Click ${resetURL} to reset your password`;

  try {
    await sendmail({
      email: user.email,
      subject: "reset your password",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "token sent to email",
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false }),
      next(
        new AppError(
          "there was an error while sending the message. Try again later",
          400
        )
      );
  }
};

const resetPassword = async (req, res, next) => {
  //get the user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //if token has not expired and there is still a user at the end of it create a new password
  if (!user) {
    return next(new AppError("token is invalid or has expired", 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //login the user and send the jwt
  createSendToken(user, 200, res);
};

exports.updatePassword = async (req, res, next) => {
  //get the user from the collection
  const user = await User.findUserById(req.user.id).select("+password");

  //check if the password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("your current password is wrong", 401));
  }
  //3 if so update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //user.findandupdate will not work as intended
  //4 log user in send jwt
  createSendToken(user, 200, res);
};
