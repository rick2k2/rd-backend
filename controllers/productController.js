const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

// GET all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

// Admin - Add new product
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    brand,
    category,
    countInStock,
    description,
    discountPercent,
  } = req.body;

  const image = req.file ? req.file.path : null;

  if (!name || !price || !image) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const discount = discountPercent || 0;
  const offerPrice = price - (price * discount) / 100;

  const newProduct = new Product({
    name,
    price,
    brand,
    category,
    countInStock,
    description,
    image,
    discountPercent: discount,
    offerPrice,
  });

  await newProduct.save();
  res.status(201).json({ message: "Product created", product: newProduct });
});

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product
exports.updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const {
      name,
      price,
      brand,
      category,
      countInStock,
      description,
      discountPercent,
    } = req.body;

    product.name = name || product.name;
    product.price = price || product.price;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;
    product.description = description || product.description;
    product.discountPercent =
      discountPercent !== undefined ? discountPercent : product.discountPercent;

    // Recalculate offerPrice
    product.offerPrice =
      product.price - (product.price * product.discountPercent) / 100;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      product.image = result.secure_url;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err });
  }
};

// reduce product countInstock when it is added in cart
exports.reduceStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.countInStock > 0) {
    await Product.updateOne(
      { _id: req.params.id },
      { $inc: { countInStock: -1 } }
    );
    res.json({
      message: "Stock reduced",
      countInStock: product.countInStock - 1,
    });
  } else {
    res.status(400).json({ message: "Out of stock" });
  }
});

// increase product countInstock when it is removed from cart
exports.increaseStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await Product.updateOne(
    { _id: req.params.id },
    { $inc: { countInStock: 1 } }
  );

  res.json({
    message: "Stock increased",
    countInStock: product.countInStock + 1,
  });
});
