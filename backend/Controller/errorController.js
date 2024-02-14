const AppError = require("../utils/AppError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const valueMatch = err.message.match(/(["'])(\\?.)*?\1/);
  const value = valueMatch ? valueMatch[0] : "not original";
  const message = `Duplicate field value: ${value}. please use a different value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = `Invalid input data. ${err.message}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  const message = `${err.message}: Please login again`;
  return new AppError(message, 401);
};

const handleTokenExpiredError = () => {
  const message = `Invalid token: The token has expired`;
  return new AppError(message, 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // operational trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else if (err.name === "CastError") {
    // Handle CastError and send the response
    const castError = handleCastErrorDB(err);
    res.status(castError.statusCode).json({
      status: castError.status,
      message: castError.message,
    });
  } else if (err.code === 11000) {
    //handle duplicate error and send the response
    const duplicateError = handleDuplicateFieldsDB(err);
    res.status(duplicateError.statusCode).json({
      status: duplicateError.status,
      message: duplicateError.message,
    });
  }
  if (err.name === "ValidationError") {
    //handle validation error and send response
    const validatorErr = handleValidationErrorDB(err);
    res.status(validatorErr.statusCode).json({
      status: validatorErr.status,
      message: validatorErr.message,
    });
  }
  if (err.name === "JsonWebTokenError") {
    const jsonTokenErr = handleJWTError(err);
    res.status(jsonTokenErr.statusCode).json({
      status: jsonTokenErr.status,
      message: jsonTokenErr.message,
    });
  }
  if (err.name === "TokenExpiredError") {
    const tokenExpiredErr = handleTokenExpiredError();
    res.status(tokenExpiredErr.statusCode).json({
      status: tokenExpiredErr.status,
      message: tokenExpiredErr.message,
    });
  } else {
    // 2. send generic message
    console.log("ERROR", err);
    res.status(500).json({
      status: "error",
      message: " Something went wrong ",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    // Check for CastError and handle it
    sendErrorProd(err, res);
  }
};
