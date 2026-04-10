const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const calculateEcoScore = require("./EcoScoring");

app.use(cors());
app.use(express.json());

const bcrypt = require("bcryptjs");
const {createUser, userData} = require("./Models/User");

const Product = require("./Models/Product");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });


    async function fetchWithRetry(url, options = {}, retries = 2, delayMs = 1000) {
      const response = await fetch(url, options);

      if (response.status === 504 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return fetchWithRetry(url, options, retries - 1, delayMs);
      }

      return response;
    }
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

  const cachedProduct = await Product.findOne({ barcode });
  if (cachedProduct) {
    return res.json({
      barcode: cachedProduct.barcode,
      product_name: cachedProduct.product_name,
      brands: cachedProduct.brands,
      image_front_small_url: cachedProduct.imageUrl,
      nutriments: cachedProduct.nutriments,
      nutrition_grades: cachedProduct.nutrition_grades,
      eco: {
        ecoScore: cachedProduct.ecoScore,
        grade: cachedProduct.ecoScoreGrade,
        ecoReason: cachedProduct.ecoReason
      }
    });
  }

  const fields =
    "product_name,brands,image_front_small_url,nutriments,nutrition_grades,packaging_tags,brand_tags,countries_tags,manufacturing_places";

  const url =
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}` +
    `?fields=${fields}&lang=en`;

  try {
    const r = await fetchWithRetry(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Scannit/1.0"
      }
    });

    const contentType = r.headers.get("content-type") || "";
    const bodyText = await r.text();

    console.log("OFF status:", r.status);
    console.log("OFF content-type:", contentType);
    console.log("OFF body preview:", bodyText.slice(0, 300));

    if (r.status === 504) {
      return res.status(504).json({
        error: "Open Food Facts is temporarily unavailable. Please try again."
      });
    }

    if (!contentType.includes("application/json")) {
      return res.status(502).json({
        error: "Unexpected response from Open Food Facts"
      });
    }

    const data = JSON.parse(bodyText);

    if (data?.status === 1 && data?.product) {
      const eco = calculateEcoScore(data.product);
      return res.json({
        ...data.product,
        eco,
      });
    }

    return res.status(404).json({ error: "Product not found" });
  } catch (e) {
    console.error("PRODUCT ROUTE ERROR:", e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/save", async (req, res) => {
  try {
    const {savedBy, barcode,productName, brands, imageUrl, eco, nutriments, nutrition_grades} = req.body;
    const user = await userData.findOne({username: savedBy});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const alreadySaved = user.savedBarcodes.includes(barcode);
    if(alreadySaved) {
      return res.status(400).json({ error: "Product already saved" });
    }

    const product = await Product.findOneAndUpdate(
      {barcode},
      {
        barcode,
        product_name: productName ?? null,
        brands: brands ?? null,
        imageUrl: imageUrl ?? null,
        ecoScore: eco?.ecoScore ?? null,
        ecoScoreGrade: eco?.grade ?? null,
        ecoReason: eco?.ecoReason ?? null,
        nutriments: nutriments ?? null,
        nutrition_grades: nutrition_grades ?? null,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    )

    const updateUser = await userData.findOneAndUpdate(
      {username: savedBy},
      {
        $addToSet: {savedBarcodes: barcode}
      },
      { new: true }
    );

    if(!updateUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ 
      message: "Product saved",
      product,
      savedBarcodes: updateUser.savedBarcodes,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/saved/:username", async (req, res) => {
  try {
    const {username} = req.params;
    const user = await userData.findOne({username});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const savedBarcodes = [...user.savedBarcodes].reverse();

    const savedProducts = await Product.find({
      barcode: {$in: user.savedBarcodes}
    })

    const orderedProducts = savedBarcodes
      .map((barcode) =>
        savedProducts.find((product) => product.barcode === barcode)
      )
      .filter(Boolean);

    res.json(orderedProducts);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.delete("/saved/:username/:barcode", async (req, res) => {
  try {
    const {username, barcode} = req.params;
    const UpdatedUser = await userData.findOneAndUpdate(
      { username },
      {$pull: { savedBarcodes: barcode } },
      { new: true }
    )
      if(!UpdatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      return res.json({ 
        message: "Product removed",
        savedBarcodes: UpdatedUser.savedBarcodes,
      });
    } catch (e) {
      console.error("Delete saved error: ", e);
      return res.status(500).json({ error: "Server error" });
    }
})
app.get("/user/:username/scans", async (req, res) => {
  try{
    const {username} = req.params;

    const user = await userData.findOne({username});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if(user.scanCredits == null) {
      user.scanCredits = 5;
    }
    if(user.isPremium === null) {
      user.isPremium = false;
    }
    if(!user.lastScanReset) {
      user.lastScanReset = new Date();
    }
    await user.save();
    return res.json({
      scanCredits: user.scanCredits,
      isPremium: user.isPremium
    })

  } catch (e) {
    console.error('Error getting scans: ', e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.post("/user/:username/rewardScans", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await userData.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.scanCredits == null) {
      user.scanCredits = 5;
    }

    user.scanCredits += 5;
    await user.save();

    return res.json({
      message: "Scans rewarded",
      scanCredits: user.scanCredits,
      isPremium: user.isPremium ?? false,
    });
  } catch (e) {
    console.error("Error rewarding scans: ", e);
    return res.status(500).json({ error: "Server error" });
  }
});
app.post("/user/:username/useScan", async (req, res) => {
  try {
    const {username} = req.params;

    const user = await userData.findOne({username});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if(user.scanCredits == null) {
      user.scanCredits = 5;
    }
    if(user.isPremium) {
      return res.json({
        message: "Premium user - no scans used",
        scanCredits: user.scanCredits,
        isPremium: true
      })
    }
    if(user.scanCredits <= 0) {
      return res.json({
        message: "No scans left",
        scanCredits: 0,
        isPremium: false
      })
    }
    user.scanCredits -= 1;
    await user.save();

    return res.json({
      message: "Scan used",
      scanCredits: user.scanCredits,
      isPremium: false
    })
  } catch (e) {
    console.error('Error using scan: ', e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.post("/login", async (req, res) => {
  try {
    const {username, password} = req.body;
    
    if(!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await userData.findOne({username});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);

    if(!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.json({
      message: "Login successful",
      user: {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    })
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
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
      return res.status(500).json({ error: "Server error" });
    }
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});