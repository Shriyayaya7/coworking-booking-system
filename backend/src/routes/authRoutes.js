const express = require("express");

const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const {
  authRateLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
  "/register",
  authRateLimiter,
  authController.register
);

router.post(
  "/login",
  authRateLimiter,
  authController.login
);

router.post(
  "/refresh",
  authController.refresh
);

router.post(
  "/logout",
  authController.logout
);

router.get(
  "/me",
  authenticate,
  authController.getMe
);

module.exports = router;