const express = require("express");

const spaceController = require("../controllers/spaceController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");

const {
  createSpaceSchema,
  updateSpaceSchema,
} = require("../validators/spaceValidator");

const {
  availabilityQuerySchema,
} = require("../validators/availabilityValidator");

const router = express.Router();

// Public routes

router.get("/", spaceController.getSpaces);

router.get(
  "/:id/availability",
  validate(availabilityQuerySchema, "query"),
  spaceController.getSpaceAvailability
);

router.get("/:id", spaceController.getSpaceById);

// Admin-only routes

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(createSpaceSchema),
  spaceController.createSpace
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateSpaceSchema),
  spaceController.updateSpace
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  spaceController.deleteSpace
);

module.exports = router;