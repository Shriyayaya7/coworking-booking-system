const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Space = require("../models/Space");
const Maintenance = require("../models/Maintenance");
const AppError = require("../utils/errors");

const createBooking = async ({
  spaceId,
  memberId,
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

  const session = await mongoose.startSession();

  try {
    let booking;

    await session.withTransaction(async () => {
      // Atomically update the space document.
      // This serializes booking creation for this space.
      const space = await Space.findOneAndUpdate(
        {
          _id: spaceId,
          isActive: true,
        },
        {
          $inc: {
            bookingLockVersion: 1,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!space) {
        throw new AppError(
          "Space not found",
          404,
          "SPACE_NOT_FOUND"
        );
      }

      const overlappingBooking = await Booking.findOne({
        space: spaceId,
        status: {
          $in: ["pending", "approved"],
        },
        startTime: {
          $lt: end,
        },
        endTime: {
          $gt: start,
        },
      }).session(session);

      if (overlappingBooking) {
        throw new AppError(
          "This space is already booked for the selected time",
          409,
          "SPACE_TIME_CONFLICT"
        );
      }

      const overlappingMaintenance =
        await Maintenance.findOne({
          space: spaceId,
          startTime: {
            $lt: end,
          },
          endTime: {
            $gt: start,
          },
        }).session(session);

      if (overlappingMaintenance) {
        throw new AppError(
          "This space is unavailable due to maintenance",
          409,
          "SPACE_MAINTENANCE_CONFLICT"
        );
      }

      const createdBookings = await Booking.create(
        [
          {
            space: spaceId,
            member: memberId,
            startTime: start,
            endTime: end,
            status: "pending",
          },
        ],
        {
          session,
        }
      );

      booking = createdBookings[0];
    });

    return booking;
  } finally {
    await session.endSession();
  }
};
const getMyBookings = async (memberId) => {
  const bookings = await Booking.find({
    member: memberId,
    status: {
      $in: ["pending", "approved"],
    },
    endTime: {
      $gt: new Date(),
    },
  })
    .populate("space", "name type capacity")
    .sort({ startTime: 1 });

  return bookings;
};

const cancelMyBooking = async (bookingId, memberId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError(
      "Invalid booking ID",
      400,
      "INVALID_BOOKING_ID"
    );
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    member: memberId,
  });

  if (!booking) {
    throw new AppError(
      "Booking not found",
      404,
      "BOOKING_NOT_FOUND"
    );
  }

  if (!["pending", "approved"].includes(booking.status)) {
    throw new AppError(
      "Only pending or approved bookings can be cancelled",
      409,
      "BOOKING_CANNOT_BE_CANCELLED"
    );
  }

  if (booking.startTime <= new Date()) {
    throw new AppError(
      "Past or already started bookings cannot be cancelled",
      409,
      "BOOKING_ALREADY_STARTED"
    );
  }

  booking.status = "cancelled";

  await booking.save();

  return booking;
};

const getAllBookings = async ({
  status,
  spaceId,
  startDate,
  endDate,
}) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

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

  const bookings = await Booking.find(filter)
    .populate("space", "name type capacity")
    .populate("member", "name email")
    .sort({ startTime: 1 });

  return bookings;
};

const approveBooking = async (bookingId) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError(
      "Invalid booking ID",
      400,
      "INVALID_BOOKING_ID"
    );
  }

  const session = await mongoose.startSession();

  try {
    let approvedBooking;

    await session.withTransaction(async () => {
      // Atomically update the space document.
      // This serializes approval operations for the same space.
      const booking = await Booking.findById(bookingId).session(
        session
      );

      if (!booking) {
        throw new AppError(
          "Booking not found",
          404,
          "BOOKING_NOT_FOUND"
        );
      }

      if (booking.status !== "pending") {
        throw new AppError(
          "Only pending bookings can be approved",
          409,
          "BOOKING_CANNOT_BE_APPROVED"
        );
      }

      const space = await Space.findOneAndUpdate(
        {
          _id: booking.space,
          isActive: true,
        },
        {
          $inc: {
            bookingLockVersion: 1,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!space) {
        throw new AppError(
          "Space not found",
          404,
          "SPACE_NOT_FOUND"
        );
      }

      const overlappingApprovedBooking =
        await Booking.findOne({
          _id: { $ne: booking._id },
          space: booking.space,
          status: "approved",
          startTime: {
            $lt: booking.endTime,
          },
          endTime: {
            $gt: booking.startTime,
          },
        }).session(session);

      if (overlappingApprovedBooking) {
        throw new AppError(
          "This booking overlaps an already approved booking",
          409,
          "APPROVED_BOOKING_CONFLICT"
        );
      }

      const overlappingMaintenance =
        await Maintenance.findOne({
          space: booking.space,
          startTime: {
            $lt: booking.endTime,
          },
          endTime: {
            $gt: booking.startTime,
          },
        }).session(session);

      if (overlappingMaintenance) {
        throw new AppError(
          "This booking overlaps a maintenance window",
          409,
          "SPACE_MAINTENANCE_CONFLICT"
        );
      }

      booking.status = "approved";

      await booking.save({ session });

      await Booking.updateMany(
        {
          _id: { $ne: booking._id },
          space: booking.space,
          status: "pending",
          startTime: {
            $lt: booking.endTime,
          },
          endTime: {
            $gt: booking.startTime,
          },
        },
        {
          $set: {
            status: "rejected",
            rejectionReason:
              "Automatically rejected because another overlapping booking was approved.",
          },
        },
        {
          session,
        }
      );

      approvedBooking = booking;
    });

    return approvedBooking;
  } finally {
    await session.endSession();
  }
};

const rejectBooking = async (bookingId, reason) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new AppError(
      "Invalid booking ID",
      400,
      "INVALID_BOOKING_ID"
    );
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError(
      "Booking not found",
      404,
      "BOOKING_NOT_FOUND"
    );
  }

  if (booking.status !== "pending") {
    throw new AppError(
      "Only pending bookings can be rejected",
      409,
      "BOOKING_CANNOT_BE_REJECTED"
    );
  }

  booking.status = "rejected";
  booking.rejectionReason = reason;

  await booking.save();

  return booking;
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  rejectBooking,
  getAllBookings,
  approveBooking
};


