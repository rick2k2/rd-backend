const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const generateInvoicePDF = require("../utils/generateInvoicePDF");

// ✅ Create a new order
exports.createOrder = asyncHandler(async (req, res) => {
  const { form, items, total, payment } = req.body;

  if (!form || !items || !total || !payment || !payment.method) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  const newOrder = new Order({
    user: req.user._id,
    name: form.name,
    phone: form.phone,
    address: form.address,
    items,
    total,
    paymentMode: payment.method,
    payment: {
      method: payment.method,
      status: payment.status || "Pending",
      transactionId: payment.transactionId || null,
    },
    status: "Pending",
  });

  await newOrder.save();

  res.status(201).json({
    success: true,
    message: "Order saved",
    orderId: newOrder._id,
  });
});

// ✅ Get all orders (Admin)
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
});

// ✅ Delete order by ID (Admin)
exports.deleteOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  await Order.findByIdAndDelete(orderId);
  res.json({ success: true, message: "Order deleted successfully" });
});

// ✅ Mark as delivered (Admin)
exports.markOrderDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  order.status = "Delivered";
  await order.save();

  res.json({ success: true, message: "Order marked as delivered" });
});

// ✅ Get my orders (User)
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// ✅ Cancel order (Admin)
exports.cancelOrderByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { cancelledBy, cancelReason } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = "Cancelled";
  order.cancelledBy = cancelledBy || "admin";
  order.cancelReason = cancelReason || "No reason provided";

  await order.save();

  res.json({ message: "Order cancelled" });
});

// ✅ Download bill (Admin)
exports.downloadOrderBillByAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    await generateInvoicePDF(orderId, res);
  } catch (err) {
    console.error("Failed to generate bill:", err);
    res.status(500).json({ error: "Failed to generate bill" });
  }
});

// ✅ Get order total amount by ID (for payment page)
exports.getOrderTotalById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({
    success: true,
    orderId: order._id,
    total: order.total,
    items: order.items,
  });
});
