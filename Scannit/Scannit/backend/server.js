const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const {createUser} = require("./Models/User");

const SavedProduct = require("./Models/Product");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });

app.use((req, _res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

app.get("/", (_req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "API is running" });
});

app.get("/product/:barcode", async (req, res) => {
  const { barcode } = req.params;

  const fields =
    "product_name,brands,image_front_small_url,nutriments,nutrition_grades,packaging_tags,brand_tags,countries_tags,manufacturing_places";

  const url =
    `https://world.openfoodfacts.net/api/v2/product/${encodeURIComponent(barcode)}` +
    `?fields=${encodeURIComponent(fields)}&lang=en`;

  try {
    const r = await fetch(url);
    const data = await r.json();

    if (data?.status === 1 && data?.product) {
      return res.json(data.product);
    }
    return res.status(404).json({ error: "Product not found" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/save", async (req, res) => {
  try {
    const { savedBy, barcode, productName, brands, imageUrl, eco } = req.body;

    if (!savedBy || !barcode) {
      return res.status(400).json({ error: "savedBy and barcode are required" });
    }

    const existing = await SavedProduct.findOne({ savedBy, barcode });
    if (existing) {
      return res.status(400).json({ error: "Product already saved" });
    }

    const saved = await SavedProduct.create(
      {
        savedBy,
        barcode,
        product_name: productName ?? null,
        brands: brands ?? null,
        imageUrl: imageUrl ?? null,
        ecoScore: eco?.ecoScore ?? null,
        ecoScoreGrade: eco?.ecoScoreGrade ?? null,
        ecoReason: eco?.ecoReason ?? null,
      },
    );

    return res.json(saved);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {

})

app.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName, email } = req.body;

  const user = await createUser(username, password, firstName, lastName, email);
    res.json({
      message: "User created",
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
    } catch (e) {
      console.log("Registration Error:", e);
      Alert.alert("Error", "Network error while registering");
    }
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});