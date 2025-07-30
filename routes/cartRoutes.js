// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} = require("../controllers/cartController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/add", protect, addToCart);
router.get("/", protect, getCart);
router.delete("/:id", protect, removeFromCart);
router.put("/:id", protect, updateCartQuantity);

module.exports = router;
