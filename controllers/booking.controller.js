import * as bookingService from "../services/booking.service.js";

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookingsService(req.user);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingByIdService(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBookingService(
      req.body,
      req.user,
    );

    res.status(201).json({
      success: true,
      message: "Đặt phòng thành công",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await bookingService.updateBookingStatusService(
      req.params.id,
      req.body.status,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái booking thành công",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
