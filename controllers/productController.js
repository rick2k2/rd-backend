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

  if (!name || !price || !req.file) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "RickDresses/products",
  });
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
  res.status(201).json({ message: "Product created", product: newProduct });
});

// Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
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
    product.offerPrice =
      product.price - (product.price * product.discountPercent) / 100;
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
    res.json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.image && product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }
    await product.deleteOne();
    res.status(200).json({
      message: "Product and associated image deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete product",
      error: err.message,
    });
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

// product review
exports.createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  // Find the product by ID
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check if the user already reviewed this product
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    return res.status(400).json({ message: "Product already reviewed" });
  }

  // Create the review object
  const review = {
    name: req.user.name,
    profileimage: req.user.profileImage || "", // fallback to empty string if undefined
    rating: Number(rating),
    comment,
    user: req.user._id,
  };

  // Add the review to product
  product.reviews.push(review);

  // Update total number of reviews
  product.numReviews = product.reviews.length;

  // Update average rating
  product.rating =
    product.reviews.reduce((acc, review) => acc + review.rating, 0) /
    product.reviews.length;

  // Save the updated product
  await product.save();

  res.status(201).json({ message: "Review added successfully" });
});

// show all review by admin
exports.getAllReviews = asyncHandler(async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Error in getAllReviews:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// delete specific review by admin
exports.deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const reviewIndex = product.reviews.findIndex(
    (review) => review._id.toString() === reviewId
  );
  if (reviewIndex === -1) {
    return res.status(404).json({ message: "Review not found" });
  }
  product.reviews.splice(reviewIndex, 1);
  // recalculate rating and numReviews
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length || 0;
  await product.save();
  res.status(200).json({ message: "Review deleted successfully" });
});
