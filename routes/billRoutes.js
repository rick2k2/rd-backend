const express = require("express");
const router = express.Router();
const { createBill, getBill } = require("../controllers/billController");

router.post("/create", createBill);
router.get("/", getBill);

module.exports = router;
