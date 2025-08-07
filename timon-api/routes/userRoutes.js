import express from "express";
import {
  signup,
  login,
  logout,
  isLoggedIn,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.get("/isLoggedIn", isLoggedIn);

export default router;
