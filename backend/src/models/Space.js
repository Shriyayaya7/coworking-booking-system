const mongoose = require("mongoose");

const spaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    type: {
      type: String,
      required: true,
      enum: ["desk", "meeting_room"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },

    amenities: {
      type: [String],
      default: [],
    }
    
    ,bookingLockVersion: {
        type: Number,
        default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

spaceSchema.index({
  name: "text",
});

spaceSchema.index({
  type: 1,
  capacity: 1,
  isActive: 1,
});

module.exports = mongoose.model("Space", spaceSchema);