const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    space: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Space",
      required: true,
      index: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startTime: {
      type: Date,
      required: true,
      index: true,
    },

    endTime: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  space: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
});

bookingSchema.index({
  member: 1,
  startTime: -1,
});

bookingSchema.index({
  status: 1,
  startTime: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);