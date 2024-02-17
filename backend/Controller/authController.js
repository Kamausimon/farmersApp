const User = require("../Model/userModel");
const AppError = require("../utils/AppError");

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

exports.login = async () => {
  const { email, password } = req.body;

  //check if the email or password have been keyed in
  if (!email || !password) {
    return next(new AppError("please fill all the required fields", 404));
  }

  //requst mongoose to check for the user
  const user = await User.findOne({ email: email }).select("+password");

  //check if the details are correct using bcrypt compare
};

exports.protectRoute = () => {};

exports.restrict = () => {};

exports.forgotPassword = () => {};

exports.updatePassword = () => {};
