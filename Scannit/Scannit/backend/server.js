const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});