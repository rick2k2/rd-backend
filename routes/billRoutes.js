const express = require("express");
const router = express.Router();
const {
  createBill,
  getAllBills,
  updateBill,
  deleteBill,
  getDueBills,
  makePayment,
} = require("../controllers/billController");

// Create new bill
router.post("/create", createBill);

// Get all bills
router.get("/all", getAllBills);

// Update bill
router.put("/update/:id", updateBill);

// Delete bill
router.delete("/:id", deleteBill);

// Show only bills with dues
router.get("/due", getDueBills);

// Pay a due amount
router.put("/pay/:id", makePayment);

module.exports = router;
