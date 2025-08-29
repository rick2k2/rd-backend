const Bill = require("../models/billModel");

// Create new bill
exports.createBill = async (req, res) => {
  try {
    const bill = new Bill(req.body);
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    console.error("Error creating bill:", err);
    res.status(500).json({ message: "Error creating bill" });
  }
};

// Get all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ message: "Error fetching bills" });
  }
};

// Get single bill by ID
exports.getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    console.error("Error fetching bill:", err);
    res.status(500).json({ message: "Error fetching bill" });
  }
};

// Update bill by ID
exports.updateBill = async (req, res) => {
  try {
    const existingBill = await Bill.findById(req.params.id);

    if (!existingBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Merge existing bill data with new data
    const updatedData = {
      customerName: req.body.customerName || existingBill.customerName,
      phone: req.body.phone || existingBill.phone,
      address: req.body.address || existingBill.address,
      items: req.body.items || existingBill.items,
      totalAmount: req.body.totalAmount || existingBill.totalAmount,
      paidAmount: req.body.paidAmount || existingBill.paidAmount,
      date: req.body.date || existingBill.date, // keep old date if not updated
    };

    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json(updatedBill);
  } catch (err) {
    console.error("Error updating bill:", err);
    res.status(500).json({ message: "Error updating bill" });
  }
};

// Delete bill by ID
exports.deleteBill = async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (!deletedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json({ message: "Bill deleted successfully" });
  } catch (err) {
    console.error("Error deleting bill:", err);
    res.status(500).json({ message: "Error deleting bill" });
  }
};

// Get only bills that have due amount (total > paid)
exports.getDueBills = async (req, res) => {
  try {
    const billsWithDue = await Bill.find({
      $expr: { $gt: ["$totalAmount", "$paidAmount"] },
    }).sort({ createdAt: -1 });

    res.json(billsWithDue);
  } catch (err) {
    console.error("Error fetching due bills:", err);
    res.status(500).json({ message: "Error fetching due bills" });
  }
};

// Make a payment (add amount to paidAmount)
exports.makePayment = async (req, res) => {
  const { amount } = req.body;

  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const due = bill.totalAmount - bill.paidAmount;

    if (amount <= 0 || amount > due) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    bill.paidAmount += amount;
    await bill.save();

    res.json({ message: "Payment successful", bill });
  } catch (err) {
    console.error("Error making payment:", err);
    res.status(500).json({ message: "Error making payment" });
  }
};
