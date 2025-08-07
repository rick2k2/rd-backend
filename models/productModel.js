const mongoose = require("mongoose");

// Review schema as a sub-document
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    profileimage: { type: String },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// Main product schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    description: { type: String },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
