const mongoose = require("mongoose");

const Maintenance = require("../models/Maintenance");
const Space = require("../models/Space");
const Booking = require("../models/Booking");
const AppError = require("../utils/errors");

const createMaintenance = async ({
  spaceId,
  startTime,
  endTime,
  reason,
  adminId,
}) => {
  if (!mongoose.Types.ObjectId.isValid(spaceId)) {
    throw new AppError(
      "Invalid space ID",
      400,
      "INVALID_SPACE_ID"
    );
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new AppError(
      "End time must be after start time",
      400,
      "INVALID_TIME_RANGE"
    );
  }

  const session = await mongoose.startSession();

  try {
    let maintenance;

    await session.withTransaction(async () => {
      const space = await Space.findOne({
        _id: spaceId,
        isActive: true,
      }).session(session);

      if (!space) {
        throw new AppError(
          "Space not found",
          404,
          "SPACE_NOT_FOUND"
        );
      }

      const overlappingMaintenance =
        await Maintenance.findOne({
          space: spaceId,
          startTime: { $lt: end },
          endTime: { $gt: start },
        }).session(session);

      if (overlappingMaintenance) {
        throw new AppError(
          "This space already has a maintenance window during the selected time",
          409,
          "MAINTENANCE_TIME_CONFLICT"
        );
      }

      const overlappingBooking = await Booking.findOne({
        space: spaceId,
        status: { $in: ["pending", "approved"] },
        startTime: { $lt: end },
        endTime: { $gt: start },
      }).session(session);

      if (overlappingBooking) {
        throw new AppError(
          "Cannot create maintenance during an existing booking",
          409,
          "MAINTENANCE_BOOKING_CONFLICT"
        );
      }

      const createdMaintenance = await Maintenance.create(
        [
          {
            space: spaceId,
            startTime: start,
            endTime: end,
            reason,
            createdBy: adminId,
          },
        ],
        { session }
      );

      maintenance = createdMaintenance[0];
    });

    return maintenance;
  } finally {
    await session.endSession();
  }
};

const getMaintenance = async ({
  spaceId,
  startDate,
  endDate,
}) => {
  const filter = {};

  if (spaceId) {
    if (!mongoose.Types.ObjectId.isValid(spaceId)) {
      throw new AppError(
        "Invalid space ID",
        400,
        "INVALID_SPACE_ID"
      );
    }

    filter.space = spaceId;
  }

  if (startDate || endDate) {
    filter.startTime = {};

    if (startDate) {
      filter.startTime.$gte = new Date(startDate);
    }

    if (endDate) {
      filter.startTime.$lte = new Date(endDate);
    }
  }

  const maintenance = await Maintenance.find(filter)
    .populate("space", "name type capacity")
    .populate("createdBy", "name email")
    .sort({ startTime: 1 });

  return maintenance;
};

const deleteMaintenance = async (maintenanceId) => {
  if (!mongoose.Types.ObjectId.isValid(maintenanceId)) {
    throw new AppError(
      "Invalid maintenance ID",
      400,
      "INVALID_MAINTENANCE_ID"
    );
  }

  const maintenance = await Maintenance.findByIdAndDelete(
    maintenanceId
  );

  if (!maintenance) {
    throw new AppError(
      "Maintenance window not found",
      404,
      "MAINTENANCE_NOT_FOUND"
    );
  }

  return maintenance;
};

module.exports = {
  createMaintenance,
  getMaintenance,
  deleteMaintenance,
};