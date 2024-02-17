const app = require("./App");
const dotenv = require("dotenv");
const connectToDATABASE = require("./db");

// Configure dotenv
dotenv.config({ path: "./config.env" });

// Call the database connection
const connect = async () => {
  try {
    await connectToDATABASE();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the application on connection error
  }
};

// Get the port from environment variables
const port = process.env.PORT || 3000;

// Start the server
let server;
const startServer = async () => {
  await connect();
  server = app.listen(port, () => {
    console.log(`The server is listening on port: ${port}`);
  });
};

startServer();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(new Date().toISOString(), err.name, err.message);
  console.error("Uncaught exception...shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error(new Date().toISOString(), err.name, err.message);
  console.error("Unhandled rejection...shutting down");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
