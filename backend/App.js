const express = require("express");
const morgan = require("morgan");
const globalerrorHandler = require("./Controller/errorController");
const AppError = require("./utils/AppError");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const app = express();
require("dotenv").config({ path: "./config.env" });

//set up the security headers
app.use(helmet());

//limit many requests from the same API
const limiter = rateLimit({
  max: 100, //limit the requests to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, //1 hr
  message:
    "Too many requests from this ip address, kindly try again in an hour",
  headers: true,
});
app.use("/api", limiter);

//enable cors
app.use(cors());

//data sanitization against nosql injection
app.use(mongoSanitize());

//prevent parameter pollution
app.use(hpp());

//ROUTER
const produceRouter = require("./Routes/produceRouter");
const userRouter = require("./Routes/userRouter");
const reviewRouter = require("./Routes/reviewRouter");
const messagesRouter = require("./Routes/messageRouter");

//MIDDLEWARES
app.use(express.json()); // this helps parse json data into req.body

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); //this is a logger with the properties dev
}

//ROUTES
app.use("/api/v1/produce", produceRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/messages", messagesRouter);

//this handles all calls made to unspecified urls in our app
app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

//universal error handler
app.use(globalerrorHandler);

module.exports = app;
