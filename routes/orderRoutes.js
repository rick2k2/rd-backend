const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  deleteOrder,
  markOrderDelivered,
  getMyOrders,
  cancelOrderByAdmin,
  downloadOrderBillByAdmin,
  getOrderTotalById,
} = require("../controllers/orderController");

const { protect, admin } = require("../middlewares/authMiddleware");

// 🛒 Place a new order
router.post("/", protect, createOrder);

// 👤 Get logged-in user's orders
router.get("/my", protect, getMyOrders);

// 📥 Get single order total by ID (for payment page)
router.get("/:id", protect, getOrderTotalById);

// 🔐 Admin routes
router.get("/admin/allorders", protect, admin, getAllOrders);
router.delete("/delete/:id", protect, admin, deleteOrder);
router.put("/deliver/:id", protect, admin, markOrderDelivered);
router.put("/cancel/:id", protect, admin, cancelOrderByAdmin);
router.get("/bill/:orderId", protect, admin, downloadOrderBillByAdmin);

module.exports = router;
