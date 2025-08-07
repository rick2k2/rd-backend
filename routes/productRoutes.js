const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  reduceStock,
  increaseStock,
  createProductReview,
  getAllReviews,
  deleteReviewByAdmin,
} = require("../controllers/productController");

// Create new product with image upload
router.post("/", upload.single("image"), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get single product by ID
router.get("/:id", getProductById);

// Delete a product by ID
router.delete("/:id", deleteProduct);

// Update product by ID with image upload support
router.put("/:id", upload.single("image"), updateProduct);

// reduce product countInstock when it is added in cart
router.patch("/reduce-stock/:id", reduceStock);

// increase product countInstock when it is removed from cart
router.patch("/increase-stock/:id", increaseStock);

// product review by user
router.post("/:id/review", protect, createProductReview);

// get all review admin
router.get("/admin/reviews", getAllReviews);
router.delete("/delete/reviews/:productId/:reviewId", deleteReviewByAdmin);

module.exports = router;
