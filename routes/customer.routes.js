import express from "express";
import * as customerController from "../controllers/customer.controller.js";
import { authMiddleware, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  authorize("owner", "admin"),
  customerController.getAllCustomers,
);

router.get("/me", customerController.getMyCustomer);
router.put("/me", customerController.updateMyCustomer);
router.get("/:id", customerController.getCustomerById);

router.post(
  "/",
  authorize("guest", "owner", "admin"),
  customerController.createCustomer,
);

router.put("/:id", customerController.updateCustomer);

router.delete(
  "/:id",
  authorize("owner", "admin"),
  customerController.deleteCustomer,
);

export default router;
