const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { protect, admin } = require("../middlewares/authMiddleware");

const {
  verifyPayment,
  getAllPayments,
  updatePaymentStatus,
  deletePayment,
  approvePayment,
} = require("../controllers/paymentController");

router.post("/verify", protect, upload.single("screenshot"), verifyPayment);
router.get("/", protect, getAllPayments);
router.put("/:id", protect, updatePaymentStatus);
router.delete("/:id", protect, deletePayment);
router.post("/approve", protect, approvePayment);

module.exports = router;
