const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    offerPrice: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
