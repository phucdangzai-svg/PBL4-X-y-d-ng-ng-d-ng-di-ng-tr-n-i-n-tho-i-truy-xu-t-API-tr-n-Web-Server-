import express from "express";
import * as bookingController from "../controllers/booking.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

router.post(
  "/",
  authorize("guest", "owner", "admin"),
  bookingController.createBooking,
);

router.patch(
  "/:id/status",
  authorize("guest", "owner", "admin"),
  bookingController.updateBookingStatus,
);

export default router;
