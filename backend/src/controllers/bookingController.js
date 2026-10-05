const bookingService = require("../services/bookingService");

const {
  createBookingSchema,
} = require("../validators/bookingValidator");

const createBooking = async (req, res, next) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);

    const booking = await bookingService.createBooking({
      ...validatedData,
      memberId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Booking request created successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getMyBookings(
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: {
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const cancelMyBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelMyBooking(
      req.params.id,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings({
      status: req.query.status,
      spaceId: req.query.spaceId,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    res.status(200).json({
      success: true,
      data: {
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

const approveBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.approveBooking(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await bookingService.rejectBooking(
      req.params.id,
      reason
    );

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  approveBooking,
  rejectBooking
};