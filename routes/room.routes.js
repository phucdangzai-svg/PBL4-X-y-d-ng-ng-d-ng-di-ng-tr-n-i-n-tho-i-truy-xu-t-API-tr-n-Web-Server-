import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public: xem danh sách và chi tiết phòng
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);

// Owner và Admin: tạo phòng
router.post(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  roomController.createRoom,
);

// Owner và Admin: cập nhật phòng
router.put(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomController.updateRoom,
);

// Owner và Admin: xóa phòng
router.delete(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomController.deleteRoom,
);

export default router;
