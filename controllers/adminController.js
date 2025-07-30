const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

exports.getAdminStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();

  res.json({
    totalProducts,
    totalUsers,
    totalOrders,
  });
});
