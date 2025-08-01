const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  deleteOrder,
  markOrderDelivered,
  getMyOrders,
  cancelOrderByAdmin,
} = require("../controllers/orderController");

const { protect, admin } = require("../middlewares/authMiddleware");

// 🛒 Place order
router.post("/", protect, createOrder);

// 🔐 Admin routes
router.get("/admin/allorders", protect, admin, getAllOrders);
router.delete("/delete/:id", protect, admin, deleteOrder);
router.put("/deliver/:id", protect, admin, markOrderDelivered);
router.put("/cancel/:id", cancelOrderByAdmin);

// 👤 Get logged-in user's order history
router.get("/my", protect, getMyOrders);

module.exports = router;
