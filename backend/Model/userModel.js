const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  //name, email, password,passwordConfirm, photo
  name: {
    type: String,
    trim: true,
    required: [true, "Kindly provide your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
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

//hashing and storing the password
userSchema.pre("save", async function (next) {
  //if the password was not modified call next.
  if (!this.isModified("password")) return next();

  //salt the password
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;

  //delete the confirm password
  this.passwordConfirm = undefined;
  next();
});

//middleware to show the date when a password was changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//returns users that are active
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
  next();
});

//middleware to compare the typed password with the stored password
userSchema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

//

const User = mongoose.model("User", userSchema);

module.exports = User;
