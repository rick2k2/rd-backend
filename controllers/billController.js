// routes/bills.js
const express = require("express");
const router = express.Router();
const Bill = require("../models/billModel");

exports.createBill = async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: "Error creating bill" });
  }
};

exports.getBill = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bills" });
  }
};
