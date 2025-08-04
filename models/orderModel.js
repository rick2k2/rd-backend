const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: String,
    quantity: Number,
    price: Number,
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["Cash on Delivery", "Online"],
      required: true,
    },
    status: {
      type: String,
      num: ["pending", "approved", "failed"],
      default: "Pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },

  items: {
    type: [itemSchema],
    required: true,
  },
  total: { type: Number, required: true },

  payment: paymentSchema,

  status: {
    type: String,
    enum: ["Pending", "Delivered", "Cancelled"],
    default: "Pending",
  },
  cancelledBy: { type: String, default: null },
  cancelReason: { type: String, default: null },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
