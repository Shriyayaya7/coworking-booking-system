const maintenanceService = require("../services/maintenanceService");

const createMaintenance = async (req, res, next) => {
  try {
    const maintenance =
      await maintenanceService.createMaintenance({
        ...req.body,
        adminId: req.user._id,
      });

    res.status(201).json({
      success: true,
      message: "Maintenance window created successfully",
      data: {
        maintenance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMaintenance = async (req, res, next) => {
  try {
    const maintenance =
      await maintenanceService.getMaintenance({
        spaceId: req.query.spaceId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      });

    res.status(200).json({
      success: true,
      data: {
        maintenance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteMaintenance = async (req, res, next) => {
  try {
    const maintenance =
      await maintenanceService.deleteMaintenance(
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Maintenance window deleted successfully",
      data: {
        maintenance,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMaintenance,
  getMaintenance,
  deleteMaintenance,
};