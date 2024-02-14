const express = require("express");
const morgan = require("morgan");

const app = express();

//ROUTER
const produceRouter = require("./Routes/produceRouter");
const userRouter = require("./Routes/userRouter");

//MIDDLEWARES
app.use(express.json()); // this helps parse json data into req.body

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); //this is a logger with the properties dev
}
//initialize the server
app.get("/", (req, res) => {
  res.send("Hello World");
});

//ROUTES
app.use("/api/v1/produce", produceRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
