const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionId, paymentAmount } = req.body;
    const screenshot = req.file?.filename;

    // 📸 Screenshot is required
    if (!req.file) {
      return res.status(400).json({ message: "📸 Screenshot is required" });
    }

    // 🛡️ Auth check
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 🧾 Check for duplicate payment
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res
        .status(409)
        .json({ message: "⚠️ Payment already submitted for this order" });
    }

    // 🛒 Fetch order to get the correct payment method
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "❌ Order not found" });
    }

    // ✅ Save payment with correct method from Order
    const payment = new Payment({
      orderId,
      user: req.user._id,
      transactionId,
      screenshot: req.file.path,
      paymentAmount: Number(paymentAmount),
      paymentMode: order.payment.method || "Online", // 👈 dynamic
    });

    await payment.save();

    res.status(201).json({ message: "✅ Payment saved successfully" });
  } catch (error) {
    console.error("❌ Server error in verifyPayment:", error);
    res.status(500).json({ message: "❌ Server error", error });
  }
};

// get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// update payment status
exports.updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status;
    await payment.save();

    // update order status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = status === "approved" ? "Paid" : "Due";
      await order.save();
    }

    res.json({ message: "Payment updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// delete payment
exports.deletePayment = async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Delete Payment Error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// payment approve by admin
exports.approvePayment = async (req, res) => {
  const { paymentId, orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.payment.status = "approved";
  await order.save();

  res.json({ message: "Payment approved and order updated" });
};
