import express from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(authorize("owner", "admin"));

router.get("/overview", dashboardController.getDashboardOverview);

export default router;
