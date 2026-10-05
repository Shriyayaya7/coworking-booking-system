const { z } = require("zod");

const createSpaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Space name must contain at least 2 characters")
    .max(100, "Space name cannot exceed 100 characters"),

  type: z.enum(["desk", "meeting_room"], {
    error: "Type must be either desk or meeting_room",
  }),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),

  amenities: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Amenity cannot be empty")
    )
    .max(50, "You cannot add more than 50 amenities")
    .optional(),
});

const updateSpaceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Space name must contain at least 2 characters")
      .max(100, "Space name cannot exceed 100 characters")
      .optional(),

    type: z
      .enum(["desk", "meeting_room"], {
        error: "Type must be either desk or meeting_room",
      })
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),

    capacity: z
      .number()
      .int("Capacity must be a whole number")
      .min(1, "Capacity must be at least 1")
      .optional(),

    amenities: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Amenity cannot be empty")
      )
      .max(50, "You cannot add more than 50 amenities")
      .optional(),

    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

module.exports = {
  createSpaceSchema,
  updateSpaceSchema,
};