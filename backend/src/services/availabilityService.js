const mongoose = require("mongoose");

const Space = require("../models/Space");
const Booking = require("../models/Booking");
const Maintenance = require("../models/Maintenance");
const AppError = require("../utils/errors");

const getSpaceAvailability = async ({
  spaceId,
  startTime,
  endTime,
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

  const space = await Space.findOne({
    _id: spaceId,
    isActive: true,
  }).select("name type capacity amenities");

  if (!space) {
    throw new AppError(
      "Space not found",
      404,
      "SPACE_NOT_FOUND"
    );
  }

  const [bookings, maintenance] = await Promise.all([
    Booking.find({
      space: spaceId,
      status: { $in: ["pending", "approved"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
      .select("startTime endTime status")
      .sort({ startTime: 1 }),

    Maintenance.find({
      space: spaceId,
      startTime: { $lt: end },
      endTime: { $gt: start },
    })
      .select("startTime endTime reason")
      .sort({ startTime: 1 }),
  ]);

  return {
    space,
    requestedRange: {
      startTime: start,
      endTime: end,
    },
    bookings,
    maintenance,
  };
};

module.exports = {
  getSpaceAvailability,
};