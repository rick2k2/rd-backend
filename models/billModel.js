// models/Bill.js
const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    customerName: String,
    phone: String,
    items: [
      {
        productName: String,
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
