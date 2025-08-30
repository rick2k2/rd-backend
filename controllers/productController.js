const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;

// 🟢 Get all products
exports.getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
});

// 🟢 Admin - Create product
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

  if (!name || !price || !req.file) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Upload image
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "RickDresses/products",
  });

  // ✅ Always calculate offerPrice
  const discount = discountPercent || 0;
  const offerPrice = price - (price * discount) / 100;

  const newProduct = new Product({
    name,
    price,
    brand,
    category,
    countInStock,
    description,
    image: {
      url: result.secure_url,
      public_id: result.public_id,
    },
    discountPercent: discount,
    offerPrice,
  });

  await newProduct.save();
  res
    .status(201)
    .json({ message: "Product created successfully", product: newProduct });
});

// 🟢 Get single product
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// 🟢 Update product
exports.updateProduct = asyncHandler(async (req, res) => {
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

  // ✅ Update discount and offer price
  product.discountPercent =
    discountPercent !== undefined ? discountPercent : product.discountPercent;
  product.offerPrice =
    product.price - (product.price * product.discountPercent) / 100;

  // Update image if provided
  if (req.file) {
    if (product.image && product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "RickDresses/products",
    });
    product.image = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  const updatedProduct = await product.save();
  res.json({
    message: "Product updated successfully",
    product: updatedProduct,
  });
});

// 🟢 Delete product
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.image && product.image.public_id) {
    await cloudinary.uploader.destroy(product.image.public_id);
  }
  await product.deleteOne();
  res.json({ message: "Product deleted successfully" });
});

// 🟢 Reduce stock when product is added to cart
exports.reduceStock = asyncHandler(async (req, res) => {
  const quantity = req.body?.quantity || 1; // safe way
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.countInStock >= quantity) {
    product.countInStock -= quantity;
    await product.save();
    res.json({ message: "Stock reduced", countInStock: product.countInStock });
  } else {
    res.status(400).json({ message: "Out of stock" });
  }
});

// 🟢 Increase stock when removed from cart
exports.increaseStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const qty = req.body.quantity || 1;
  product.countInStock += qty;
  await product.save();
  res.json({ message: "Stock increased", countInStock: product.countInStock });
});

// 🟢 Create product review
exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  // Prevent duplicate review
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    return res.status(400).json({ message: "Product already reviewed" });
  }

  const review = {
    name: req.user.name,
    profileimage: req.user.profileImage || "",
    rating: Number(rating),
    comment,
    user: req.user._id,
    createdAt: Date.now(),
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) /
    product.reviews.length;
  await product.save();
  res.status(201).json({ message: "Review added successfully" });
});

// 🟢 Get all reviews
exports.getAllReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  const allReviews = [];

  products.forEach((product) => {
    product.reviews?.forEach((review) => {
      allReviews.push({
        productId: product._id,
        productName: product.name,
        reviewId: review._id,
        name: review.name,
        profileImage: review.profileimage,
        rating: review.rating,
        comment: review.comment,
      });
    });
  });

  res.status(200).json(allReviews);
});

// 🟢 Delete review
exports.deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  product.reviews = product.reviews.filter(
    (review) => review._id.toString() !== reviewId
  );

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length || 0;

  await product.save();
  res.status(200).json({ message: "Review deleted successfully" });
});
