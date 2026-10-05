const { z } = require("zod");

const availabilityQuerySchema = z
  .object({
    startTime: z.string().datetime({
      message: "startTime must be a valid ISO date-time",
    }),

    endTime: z.string().datetime({
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

module.exports = {
  availabilityQuerySchema,
};