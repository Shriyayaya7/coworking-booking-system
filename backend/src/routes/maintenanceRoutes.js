const express = require("express");

const maintenanceController = require("../controllers/maintenanceController");
const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  createMaintenanceSchema,
} = require("../validators/maintenanceValidator");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("admin"),
  validate(createMaintenanceSchema),
  maintenanceController.createMaintenance
);

router.get(
  "/",
  authenticate,
  authorizeRoles("admin"),
  maintenanceController.getMaintenance
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin"),
  maintenanceController.deleteMaintenance
);

module.exports = router;