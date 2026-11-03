import { createOtaBookingService } from "../services/otaBooking.service.js";

export const createOtaBooking = async (req, res, next) => {
  try {
    const result = await createOtaBookingService(req.body, req.channel);

    return res.status(201).json({
      success: true,
      message: "OTA Booking received successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
