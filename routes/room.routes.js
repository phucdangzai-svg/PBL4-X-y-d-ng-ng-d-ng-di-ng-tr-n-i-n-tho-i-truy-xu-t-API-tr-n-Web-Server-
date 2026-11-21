import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { uploadRoomImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

// =====================================
// PUBLIC API - Guest khong can dang nhap
// =====================================

router.get("/public", roomController.getPublicRooms);
router.get("/public/:id", roomController.getPublicRoomById);

// =====================================
// ADMIN API - Owner va Admin phai dang nhap
// =====================================

router.get(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  roomController.getAllRooms,
);

router.get(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomController.getRoomById,
);

// Owner va Admin: tao phong
router.post(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  uploadRoomImage,
  roomController.createRoom,
);

// Owner va Admin: cap nhat thong tin phong
router.put(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  uploadRoomImage,
  roomController.updateRoom,
);

// Owner va Admin: cap nhat anh phong
router.put(
  "/:id/image",
  authMiddleware,
  authorize("owner", "admin"),
  uploadRoomImage,
  roomController.updateRoomImage,
);

// Owner va Admin: xoa phong
router.delete(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomController.deleteRoom,
);

export default router;
