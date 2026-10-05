const Space = require("../models/Space");
const AppError = require("../utils/errors");
const availabilityService = require("../services/availabilityService");

const createSpace = async (req, res, next) => {
  try {
    const {
    name,
    type,
    description,
    capacity,
    amenities,
    } = req.body;

    const space = await Space.create({
      name,
      type,
      description,
      capacity,
      amenities,
    });

    res.status(201).json({
      success: true,
      message: "Space created successfully",
      data: {
        space,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSpaces = async (req, res, next) => {
  try {
    const {
      search = "",
      type,
      minCapacity,
      maxCapacity,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const perPage = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const filter = {
      isActive: true,
    };

    if (search.trim()) {
      filter.$text = {
        $search: search.trim(),
      };
    }

    if (type) {
      filter.type = type;
    }

    if (minCapacity !== undefined || maxCapacity !== undefined) {
      filter.capacity = {};

      if (minCapacity !== undefined) {
        filter.capacity.$gte = Number(minCapacity);
      }

      if (maxCapacity !== undefined) {
        filter.capacity.$lte = Number(maxCapacity);
      }
    }

    const skip = (currentPage - 1) * perPage;

    const [spaces, total] = await Promise.all([
      Space.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      Space.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        spaces,
        pagination: {
          page: currentPage,
          limit: perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSpaceById = async (req, res, next) => {
  try {
    const space = await Space.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!space) {
      throw new AppError(
        "Space not found",
        404,
        "SPACE_NOT_FOUND"
      );
    }

    res.status(200).json({
      success: true,
      data: {
        space,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateSpace = async (req, res, next) => {
  try {
    const {
      name,
      type,
      description,
      capacity,
      amenities,
      isActive,
    } = req.body;

    const space = await Space.findById(req.params.id);

    if (!space) {
      throw new AppError(
        "Space not found",
        404,
        "SPACE_NOT_FOUND"
      );
    }

    if (name !== undefined) {
      space.name = name;
    }

    if (type !== undefined) {
      space.type = type;
    }

    if (description !== undefined) {
      space.description = description;
    }

    if (capacity !== undefined) {
      space.capacity = capacity;
    }

    if (amenities !== undefined) {
      space.amenities = amenities;
    }

    if (isActive !== undefined) {
      space.isActive = isActive;
    }

    await space.save();

    res.status(200).json({
      success: true,
      message: "Space updated successfully",
      data: {
        space,
      },
    });
  } catch (error) {
    next(error);
  }
};

const deleteSpace = async (req, res, next) => {
  try {
    const space = await Space.findById(req.params.id);

    if (!space) {
      throw new AppError(
        "Space not found",
        404,
        "SPACE_NOT_FOUND"
      );
    }

    space.isActive = false;

    await space.save();

    res.status(200).json({
      success: true,
      message: "Space deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getSpaceAvailability = async (req, res, next) => {
  try {
    const availability =
      await availabilityService.getSpaceAvailability({
        spaceId: req.params.id,
        startTime: req.query.startTime,
        endTime: req.query.endTime,
      });

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSpace,
  getSpaces,
  getSpaceById,
  getSpaceAvailability,
  updateSpace,
  deleteSpace,
};