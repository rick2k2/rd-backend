const express = require("express");
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  getDueBills,
  makePayment,
} = require("../controllers/billController");

// Create new bill
router.post("/create", createBill);

// Get all bills
router.get("/all", getAllBills);

// Get single bill by ID
router.get("/:id", getBillById);

// Update bill
router.put("/update/:id", updateBill);

// Delete bill
router.delete("/:id", deleteBill);

// Show only bills with dues
router.get("/due/bill-data", getDueBills);

// Pay a due amount
router.put("/pay/:id", makePayment);

module.exports = router;
