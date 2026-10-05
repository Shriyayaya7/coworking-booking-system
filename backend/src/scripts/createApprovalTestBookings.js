require("dotenv").config();

const connectDB = require("../config/database");
const Booking = require("../models/Booking");
const Space = require("../models/Space");
const User = require("../models/User");

const createApprovalTestBookings = async () => {
  try {
    await connectDB();

    const space = await Space.findOne({
      name: "Meeting Room 1",
    });

    const member = await User.findOne({
      email: "shriya@example.com",
    });

    if (!space) {
      throw new Error("Meeting Room 1 not found");
    }

    if (!member) {
      throw new Error("Member shriya@example.com not found");
    }

    const startA = new Date("2026-10-08T10:00:00.000Z");
    const endA = new Date("2026-10-08T12:00:00.000Z");

    const startB = new Date("2026-10-08T11:00:00.000Z");
    const endB = new Date("2026-10-08T13:00:00.000Z");

    const bookings = await Booking.insertMany([
      {
        space: space._id,
        member: member._id,
        startTime: startA,
        endTime: endA,
        status: "pending",
      },
      {
        space: space._id,
        member: member._id,
        startTime: startB,
        endTime: endB,
        status: "pending",
      },
    ]);

    console.log("Test bookings created successfully.");

    bookings.forEach((booking) => {
      console.log({
        id: booking._id.toString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
      });
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create test bookings:", error);
    process.exit(1);
  }
};

createApprovalTestBookings();