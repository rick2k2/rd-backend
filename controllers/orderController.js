const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const generateInvoicePDF = require("../utils/generateInvoicePDF");
const sendEmail = require("../utils/sendEmail");

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

  // ✅ Generate HTML template for email
  const orderItemsHTML = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #eee; text-align: left;">
          ${item.name}
        </td>
        <td style="padding: 8px; border: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 8px; border: 1px solid #eee; text-align: right;">
          ₹${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Rick Dresses Online - New Order</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.1)">
    <div style="text-align:center;padding-bottom:15px;border-bottom:1px solid #eee;">
      <h1 style="color:#ff6600;margin:0;font-size:24px;">Rick Dresses Online</h1>
      <p style="color:#555;margin-top:5px;">🛍️ New Order Notification</p>
    </div>

    <p style="color:#333;font-size:16px;">Hello Admin,</p>
    <p style="color:#333;font-size:16px;">A new order has been placed on <b>Rick Dresses Online</b>.</p>

    <h3 style="color:#ff6600;margin-top:20px;">Customer Details</h3>
    <p><b>Name:</b> ${form.name}</p>
    <p><b>Phone:</b> ${form.phone}</p>
    <p><b>Address:</b> ${form.address}</p>
    <p><b>Payment Method:</b> ${payment.method}</p>

    <h3 style="color:#ff6600;margin-top:20px;">Order Summary</h3>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <thead>
        <tr>
          <th style="padding:8px;border:1px solid #eee;text-align:left;background:#ff6600;color:#fff;">Product</th>
          <th style="padding:8px;border:1px solid #eee;text-align:center;background:#ff6600;color:#fff;">Qty</th>
          <th style="padding:8px;border:1px solid #eee;text-align:right;background:#ff6600;color:#fff;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${orderItemsHTML}
      </tbody>
    </table>

    <p style="font-size:18px;margin-top:15px;color:#000;">
      <b>Total Amount: ₹${total}</b>
    </p>

    <div style="text-align:center;margin-top:25px;">
      <a href="https://rickdresses.vercel.app/admin/orders" style="background:#ff6600;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none;font-size:16px;">
        View Order in Admin Panel
      </a>
    </div>

    <p style="margin-top:25px;color:#777;font-size:13px;text-align:center;">
      This is an automated email from <b>Rick Dresses Online</b>.
    </p>
  </div>
</body>
</html>
`;

  // ✅ Send email to admin
  try {
    await sendEmail(
      process.env.EMAIL_USER,
      "🛍️ New Order Placed - Rick Dresses Online",
      htmlTemplate
    );
    console.log("✅ HTML email sent to admin successfully!");
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }

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
