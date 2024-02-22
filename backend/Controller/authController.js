const User = require("../Model/userModel");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const sendEmail = require("../utils/sendEmail");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

//create a jtw sign token
const signToken = (id) => {
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
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
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
  try {
    //confirm that the token is present
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("you are not logged in, Kindly login to access", 401)
      );
    }

    //verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

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
  } catch (err) {
    console.log(err);
  }
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
  //1 Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }
  //2 Generate the random token
  const resetToken = user.createResetToken();

  await user.save({ validateBeforeSave: false });
  //3 send it back as an email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm to ${resetURL}, \n If you didn't forget your passsword please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset Token (valid for 10 minutes)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email, retry again later",
        500
      )
    );
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Check if token exists
    if (!req.params.token) {
      return next(new AppError("Token is missing", 400));
    }

    // Hash the token from the request params
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // Find user with valid token and token not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // If no user found or token expired, return error
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 401));
    }

    // Check if password and passwordConfirm fields are present
    if (!req.body.password || !req.body.passwordConfirm) {
      return next(
        new AppError("Password and password confirmation are required", 400)
      );
    }

    // Update user's password and clear reset token fields
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Save user to the database
    await user.save();

    // Respond with success message
    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error resetting password:", error);
    next(new AppError("An error occurred while resetting password", 500));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // Get the user from the collection
    const user = await User.findById(req.user.id).select("+password");

    // Check if the user exists
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if the current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Your current password is wrong", 401));
    }

    // Update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // Log user in and send JWT
    createSendToken(user, 200, res);
  } catch (error) {
    console.error("Error updating password:", error);
    next(new AppError("An error occurred while updating password", 500));
  }
};
