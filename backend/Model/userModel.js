const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  //name, email, password,passwordConfirm, photo
  Name: {
    type: String,
    trim: true,
    required: [true, "Kindly provide your name"],
  },
  email: {
    type: String,
    validator: [validator.isEmail, "provide a valid email"],
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: function (el) {
      return el === this.password;
    },
    message: `The passwords don't match`,
  },
  passwordCreatedAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin", "Farmer"],
    default: "user",
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
