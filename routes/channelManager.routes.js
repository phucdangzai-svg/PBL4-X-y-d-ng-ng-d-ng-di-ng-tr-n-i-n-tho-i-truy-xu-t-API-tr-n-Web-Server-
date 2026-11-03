import express from "express";

import { otaAuthMiddleware } from "../middlewares/otaAuth.middleware.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

import { createOtaBooking } from "../controllers/otaBooking.controller.js";

import {
  getChannels,
  updateChannelStatus,
  getMappings,
  createMapping,
  updateMapping,
  deleteMapping,
  getSyncLogs,
} from "../controllers/channelManager.controller.js";

const router = express.Router();

// ======================================
// OTA BOOKING
// OTA gửi booking bằng API Key
// ======================================

router.post("/bookings", otaAuthMiddleware, createOtaBooking);

// ======================================
// CHANNEL MANAGEMENT
// Nhân viên quản lý dùng JWT
// ======================================

router.get(
  "/channels",
  authMiddleware,
  authorize("admin", "owner"),
  getChannels,
);

// bật hoặc tắt OTA thông qua id và status:inactive và
router.patch(
  "/channels/:id/status",
  authMiddleware,
  authorize("admin", "owner"),
  updateChannelStatus,
);

// ======================================
// ROOM MAPPINGS
// ======================================

router.get(
  "/mappings",
  authMiddleware,
  authorize("admin", "owner"),
  getMappings,
);

router.post(
  "/mappings",
  authMiddleware,
  authorize("admin", "owner"),
  createMapping,
);

router.patch(
  "/mappings/:id",
  authMiddleware,
  authorize("admin", "owner"),
  updateMapping,
);

router.delete(
  "/mappings/:id",
  authMiddleware,
  authorize("admin", "owner"),
  deleteMapping,
);

// ======================================
// SYNC LOGS
// ======================================

router.get(
  "/sync-logs",
  authMiddleware,
  authorize("admin", "owner"),
  getSyncLogs,
);

export default router;
