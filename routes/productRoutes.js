const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
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

module.exports = router;
