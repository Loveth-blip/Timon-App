import express from "express";

import AppError from "./utilities/appError.js";
import globalErrorHandler from "./controllers/errorController.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

// ROUTES

app.use("/api/v1/user", userRouter);
// app.use("/api/v1/product", productRouter);
// app.use("/api/v1/order", orderRouter);
// app.use("/api/v1/review", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
