const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const SavedProductSchema = new Schema(
  {
    barcode: { type: String, required: true },
    product_name: { type: String, default: null },
    brands: { type: String, default: null },
    imageUrl: { type: String, default: null },

    ecoScore: { type: Number, default: null },
    ecoScoreGrade: { type: String, default: null },
    ecoReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = model("SavedProduct", SavedProductSchema);