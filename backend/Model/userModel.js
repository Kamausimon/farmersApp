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
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

//middleware to compare the typed password with the stored password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//check if password was changed
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

//this creates a password reset token
userSchema.methods.createResetToken = async function () {
  try {
    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log({ resetToken }, this.passwordResetToken);
    // Set token and expiry date on the user object

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Return the original unhashed token for use in generating the reset URL
    return resetToken;
  } catch (error) {
    // Handle any errors that occur during token generation
    console.error("Error generating reset token:", error);
    throw new Error("Could not generate reset token");
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
