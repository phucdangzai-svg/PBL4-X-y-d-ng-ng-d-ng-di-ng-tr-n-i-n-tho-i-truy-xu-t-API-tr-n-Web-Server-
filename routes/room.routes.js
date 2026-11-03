import express from "express";
import * as roomController from "../controllers/room.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";
import { uploadRoomImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public: xem danh sách và chi tiết phòng
router.get("/", roomController.getAllRooms);
router.get("/:id", roomController.getRoomById);

// Owner và Admin: tải ảnh phòng lên
router.post(
  "/upload-image",
  authMiddleware,
  authorize("owner", "admin"),
  uploadRoomImage,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh",
      });
    }

    res.status(201).json({
      success: true,
      message: "Upload ảnh thành công",
      data: {
        image_url: `/uploads/rooms/${req.file.filename}`,
      },
    });
  },
);

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
