const { z } = require("zod");

const createBookingSchema = z
  .object({
    spaceId: z
      .string()
      .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid space ID"
      ),

    startTime: z
      .string()
      .datetime({
        message: "startTime must be a valid ISO date-time",
      }),

    endTime: z
      .string()
      .datetime({
        message: "endTime must be a valid ISO date-time",
      }),
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "endTime must be after startTime",
      path: ["endTime"],
    }
  );

const rejectBookingSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Rejection reason is required")
    .max(500, "Rejection reason cannot exceed 500 characters"),
});

module.exports = {
  createBookingSchema,
  rejectBookingSchema,
};