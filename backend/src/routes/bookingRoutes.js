const express = require("express");

const bookingController = require("../controllers/bookingController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { rejectBookingSchema } = require("../validators/bookingValidator");
const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("member"),
  bookingController.createBooking
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("member"),
  bookingController.getMyBookings
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorizeRoles("member"),
  bookingController.cancelMyBooking
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  bookingController.getAllBookings
);

router.patch(
  "/:id/approve",
  authenticate,
  authorizeRoles("admin"),
  bookingController.approveBooking
);

router.patch(
  "/:id/reject",
  authenticate,
  authorizeRoles("admin"),
  validate(rejectBookingSchema),
  bookingController.rejectBooking
);

module.exports = router;