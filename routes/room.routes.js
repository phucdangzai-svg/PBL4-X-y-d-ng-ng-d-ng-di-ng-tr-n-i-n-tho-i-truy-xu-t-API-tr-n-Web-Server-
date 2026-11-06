import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { uploadRoomImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public: xem danh sach va chi tiet phong
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);

// Owner va Admin: tao phong (co the kem anh)
router.post(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  uploadRoomImage,
  roomController.createRoom,
);

// Owner va Admin: cap nhat thong tin phong (co the kem anh moi)
router.put(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  uploadRoomImage,
  roomController.updateRoom,
);

// Owner va Admin: chi cap nhat anh phong
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
