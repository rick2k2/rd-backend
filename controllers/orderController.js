const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

// ✅ Place a new order (only if logged in)
exports.createOrder = asyncHandler(async (req, res) => {
  const { form, items, total } = req.body;

  if (!form || !items || !total) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const newOrder = new Order({
    user: req.user._id, // ✅ Associate order with user
    name: form.name,
    phone: form.phone,
    address: form.address,
    items,
    total,
    status: "Pending", // ✅ Default status
  });

  await newOrder.save();

  res.status(201).json({ success: true, message: "Order saved" });
});

// 🔹 GET all orders (admin only)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
});

// 🔥 DELETE an order by ID (admin only)
exports.deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  await Order.findByIdAndDelete(orderId);
  res.json({ success: true, message: "Order deleted successfully" });
});

// ✅ Mark order as delivered (admin only)
exports.markOrderDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  order.status = "Delivered";
  await order.save();

  res.json({ success: true, message: "Order marked as delivered" });
});

// ✅ Get my orders (user)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});
