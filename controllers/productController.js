const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");

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
  const { name, price, brand, category, countInStock, description } = req.body;

  const image = req.file ? req.file.path : null; // If you're using multer

  if (!name || !price || !image) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newProduct = new Product({
    name,
    price,
    brand,
    category,
    countInStock,
    description,
    image,
  });
  console.log("req.body:", req.body);
  console.log("req.file:", req.file);
  await newProduct.save();
  res.status(201).json({ message: "Product created", product: newProduct });
});

// get single product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, price, brand, category, countInStock, description } =
      req.body;

    product.name = name || product.name;
    product.price = price || product.price;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.countInStock = countInStock || product.countInStock;
    product.description = description || product.description;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      product.image = result.secure_url;
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
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
