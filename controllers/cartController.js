// controllers/cartController.js
const CartItem = require("../models/cartModel");
const asyncHandler = require("express-async-handler");

// @desc Add to cart
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cartItem = await CartItem.findOne({
    user: req.user._id,
    product: productId,
  });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
    res.json({ message: "Cart updated", cartItem });
  } else {
    const newItem = await CartItem.create({
      user: req.user._id,
      product: productId,
      quantity,
    });
    res.status(201).json({ message: "Added to cart", cartItem: newItem });
  }
});

// Get cart items
exports.getCart = asyncHandler(async (req, res) => {
  const items = await CartItem.find({ user: req.user._id }).populate("product");
  res.json(items);
});

// Remove item
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await CartItem.findOneAndDelete({ _id: id, user: req.user._id });
  res.json({ message: "Item removed" });
});

// Update quantity
exports.updateCartQuantity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = await CartItem.findOne({ _id: id, user: req.user._id });
  if (item) {
    item.quantity = quantity;
    await item.save();
    res.json({ message: "Quantity updated", item });
  } else {
    res.status(404).json({ message: "Item not found" });
  }
});
