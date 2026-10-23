import express from "express";
import roomRouter from "./room.routes.js";
import roomTypeRoutes from "./roomType.routes.js";
import authRoutes from "./auth.routes.js";
import customerRoutes from "./customer.routes.js";
import bookingRoutes from "./booking.routes.js";

const router = express.Router();

router.use("/rooms", roomRouter);
router.use("/room-type", roomTypeRoutes);
router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/bookings", bookingRoutes);

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PMS Backend is running",
  });
});

export default router;
