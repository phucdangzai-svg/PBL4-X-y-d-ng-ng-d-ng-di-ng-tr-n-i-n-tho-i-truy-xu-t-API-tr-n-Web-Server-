import express from "express";
import * as roomTypeController from "../controllers/roomType.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// PUBLIC API - Guest
router.get("/public", roomTypeController.getPublicRoomTypes);
router.get("/public/:id", roomTypeController.getPublicRoomTypeById);

// ADMIN API - Owner/Admin
router.get(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.getAllRoomTypes,
);

router.get(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.getRoomTypeById,
);

// CREATE
router.post(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.createRoomType,
);

// UPDATE
router.put(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.updateRoomType,
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.deleteRoomType,
);

export default router;
