const { z } = require("zod");

const createMaintenanceSchema = z
  .object({
    spaceId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid space ID"),

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

    reason: z
      .string()
      .trim()
      .min(1, "Reason is required")
      .max(500, "Reason cannot exceed 500 characters"),
  })
  .refine(
    (data) => new Date(data.endTime) > new Date(data.startTime),
    {
      message: "endTime must be after startTime",
      path: ["endTime"],
    }
  );

module.exports = {
  createMaintenanceSchema,
};