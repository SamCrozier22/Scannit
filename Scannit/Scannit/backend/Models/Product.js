const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    barcode: { 
      type: String, 
      required: true, 
      index: true, 
      unique: true, 
      trim: true
    },
    product_name: { 
      type: String, 
      default: null,
      trim: true
    },
    brands: { 
      type: String, 
      default: null,
      trim: true
    },
    imageUrl: { 
      type: String, 
      default: null,
      trim: true
    },
    nutriments: {
      type: Object,
      default: null
    },
    ingredients: { 
      type: Array, 
      default: [] 
    },
    ingredients_text: { 
      type: String, 
      default: null 
    },
    additives_tags: { 
      type: [String], 
      default: [] 
    },
    nova_group: { 
      type: Number, 
      default: null 
    },
    ingredients_language: {
      type: String,
      default: null,
      trim: true
    },
    nutrition_grades: {
      type: String,
      default: null,
      trim: true
    },
    ecoScore: { 
      type: Number, 
      default: null,
    },
    ecoScoreGrade: { 
      type: String, 
      default: null,
      trim: true
    },
    ecoReason: [
      {
        impact: {type: String, default: null, trim: true},
        message: {type: String, default: null, trim: true}
      }
    ],
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);