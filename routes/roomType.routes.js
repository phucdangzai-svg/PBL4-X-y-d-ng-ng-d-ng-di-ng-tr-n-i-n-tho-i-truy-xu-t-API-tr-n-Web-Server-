import express from "express";
import * as roomTypeController from "../controllers/roomType.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", roomTypeController.getAllRoomTypes);
router.get("/:id", roomTypeController.getRoomTypeById);

router.post(
  "/",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.createRoomType,
);

router.put(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.updateRoomType,
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("owner", "admin"),
  roomTypeController.deleteRoomType,
);

export default router;
