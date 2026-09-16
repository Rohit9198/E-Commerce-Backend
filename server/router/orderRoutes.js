import express from "express";
import {
     fetchSingleOrder,
     placeNewOrder,
     verifyPayment,
     fetchMyOrders,
     fetchAllOrders,
     updateOrderStatus,
     deleteOrder,
     deletePendingOrder,
} from "../controllers/orderController.js";
import {
  isAuthenticated,
  authorizedRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Static routes MUST come before dynamic /:orderId
router.post("/new", isAuthenticated, placeNewOrder);
router.post("/verify-payment", isAuthenticated, verifyPayment);
router.get("/me", isAuthenticated, fetchMyOrders);
router.get("/orders/me", isAuthenticated, fetchMyOrders);
router.delete("/pending/:orderId", isAuthenticated, deletePendingOrder);
router.get(
  "/admin/getall",
  isAuthenticated,
  authorizedRoles("Admin"),
  fetchAllOrders
);
router.put(
  "/admin/update/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  updateOrderStatus
);
router.delete(
  "/admin/delete/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  deleteOrder
);

// Dynamic route LAST to avoid swallowing static paths
router.get("/:orderId", isAuthenticated, fetchSingleOrder);

export default router;