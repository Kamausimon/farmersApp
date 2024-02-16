const User = require("../Model/userModel");

const signUp = async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.Name,
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
};

const login = () => {};

const protectRoute = () => {};

const restrict = () => {};

const forgotPassword = () => {};

const updatePassword = () => {};
