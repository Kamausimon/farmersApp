const express = require("express");
const morgan = require("morgan");
const globalerrorHandler = require("./Controller/errorController");
const AppError = require("./utils/AppError");
const dotenv = require("dotenv");

const app = express();
dotenv.config({ path: "./config.env" });

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
