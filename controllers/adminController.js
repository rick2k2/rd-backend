const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Post = require("../models/postModel");
const Bill = require("../models/billModel");
const asyncHandler = require("express-async-handler");

exports.getAdminStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalPosts = await Post.countDocuments();
  const totalBills = await Bill.countDocuments();

  res.json({
    totalProducts,
    totalOrders,
    totalUsers,
    totalPosts,
    totalBills,
  });
});
