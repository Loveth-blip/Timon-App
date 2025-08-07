import mongoose from "mongoose";
// const debug = require('debug')('server');
import chalk from "chalk";

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();
import app from "./app.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥💥 Shutting down....");
  console.log(err.name, err.message, err);
  process.exit(1);
});

const dbUrl = process.env.MONGODB_URI;

mongoose
  .connect(dbUrl)
  .then(() => console.log(`DB connection ${chalk.green("successful")}`))
  .catch((err) => {
    console.log(`DB connection ${chalk.red("failed")}`);
    console.log(err.message);
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening on port ${chalk.green(port)}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLE REJECTION! 💥💥 Shutting down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
