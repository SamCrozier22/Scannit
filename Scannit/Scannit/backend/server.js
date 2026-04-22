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

function ensureScanDefaults(user) {
  if (user.scanCredits == null) user.scanCredits = 5;
  if (!user.lastScanReset) user.lastScanReset = new Date();
  if (user.adsWatchedToday == null) user.adsWatchedToday = 0;
  if (!user.lastAdReset) user.lastAdReset = new Date();
}

function handleDailyReset(user) {
  if(!user.lastScanReset) {
    user.lastScanReset = new Date();
  }
  const now = new Date();
  const lastReset = new Date(user.lastScanReset);

  const diffMins = now - lastReset;
  const diffHours = diffMins / (1000 * 60 * 60);

  if(diffHours >= 24) {
    user.scanCredits = 5;
    user.lastScanReset = new Date();
  }
}
function handleAdReset(user) {
  if(!user.lastAdReset) {
    user.lastAdReset = new Date();
  }
  const now = new Date();
  const lastReset = new Date(user.lastAdReset);

  const diffMins = now - lastReset;
  const diffHours = diffMins / (1000 * 60 * 60);

  if(diffHours >= 24) {
    user.adsWatchedToday = 0;
    user.lastAdReset = new Date();
  }
}
async function handlePremiumRenewal(user) {
  if(!user.autoRenew) return;
  if(!user.premiumEnd) return;

  const now = new Date();

  if(user.premiumEnd <= now) {
    const newStart = new Date(user.premiumEnd);
    const newEnd = new Date(user.premiumEnd);
    newEnd.setMonth(newEnd.getMonth() + 1);

    user.premiumStart = newStart;
    user.premiumEnd = newEnd;

    await user.save();
  }
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
    if (r.status === 429) {
      return res.status(429).json({
        error: "Open Food Facts is rate-limited. Please try again later."
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

      await Product.findOneAndUpdate(
        { barcode },
        {
          barcode,
          product_name: data.product.product_name ?? null,
          brands: data.product.brands ?? null,
          imageUrl: data.product.image_front_small_url ?? null,
          ecoScore: eco?.ecoScore ?? null,
          ecoScoreGrade: eco?.grade ?? null,
          ecoReason: eco?.ecoReason ?? null,
          nutriments: data.product.nutriments ?? null,
          nutrition_grades: data.product.nutrition_grades ?? null,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

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
      return res.status(400).json({ message: "Product already saved" });
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
    
    ensureScanDefaults(user);
    handleDailyReset(user);
    await handlePremiumRenewal(user);

    const premium = user.isActivePremium();

    
    if(!user.lastScanReset) {
      user.lastScanReset = new Date();
    }
    await user.save();

    return res.json({
      scanCredits: user.scanCredits,
      isPremium: premium,
      adsWatchedToday: user.adsWatchedToday
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

    ensureScanDefaults(user);
    handleDailyReset(user);
    await handlePremiumRenewal(user);
    const premium = user.isActivePremium();


    handleAdReset(user);

    if(user.adsWatchedToday >= 5) {
      return res.status(400).json({
        error: "You reached your ads watch limit today",
        adsWatchedToday: user.adsWatchedToday
      })
    }

    user.scanCredits += 5;
    user.adsWatchedToday += 1;
    await user.save();

    return res.json({
      message: "Scans rewarded",
      scanCredits: user.scanCredits,
      adsWatchedToday: user.adsWatchedToday,
      isPremium: premium,
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

    ensureScanDefaults(user);
    handleDailyReset(user);
    await handlePremiumRenewal(user);
    const premium = user.isActivePremium();


    if(premium) {
      return res.json({
        message: "Premium user - no scans used",
        scanCredits: user.scanCredits,
        isPremium: premium
      })
    }
    if(user.scanCredits <= 0) {
      return res.status(400).json({
        error: "No scans left",
        scanCredits: 0,
        isPremium: premium
      })
    }
    user.scanCredits -= 1;
    await user.save();
console.log("hello")
    return res.json({
      message: "Scan used",
      scanCredits: user.scanCredits,
      isPremium: premium,
      adsWatchedToday: user.adsWatchedToday
    })
  } catch (e) {
    console.error('Error using scan: ', e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.get("/user/:username/premium", async (req, res) => {
  try {
    const {username} = req.params;

    const user = await userData.findOne(
      {username},
      {
        username: 1,
        firstName: 1,
        lastName: 1,
        premiumStart: 1,
        premiumEnd: 1,
        autoRenew: 1
      }
    );
    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await handlePremiumRenewal(user);

    const isPremium = user.isActivePremium();

    

    return res.json({
      isPremium,
      premiumStart: user.premiumStart,
      premiumEnd: user.premiumEnd,
      autoRenew: user.autoRenew ?? true
    })
  } catch (e) {
    console.error('Error getting premium status: ', e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.post("/user/:username/buyPremium", async (req, res) => {
  try {
    const {username} = req.params;

    const user = await userData.findOne({username});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const now = new Date();

    let premiumStartDate;
    let premiumEndDate;

    const wasRenewal = user.isActivePremium();

    if(wasRenewal) {
      premiumStartDate = user.premiumStart ?? now;
      premiumEndDate = new Date(user.premiumEnd);
      premiumEndDate.setMonth(premiumEndDate.getMonth() + 1);
    } else {
      premiumStartDate = now;
      premiumEndDate = new Date(now);
      premiumEndDate.setMonth(premiumEndDate.getMonth() + 1);
    }

    user.premiumStart = premiumStartDate;
    user.premiumEnd = premiumEndDate;
    user.autoRenew = true;

    await user.save();

    return res.json({
      message: wasRenewal ? "Premium renewed" : "Premium bought",
      isPremium: user.isActivePremium(),
      premiumStart: user.premiumStart,
      premiumEnd: user.premiumEnd,
      autoRenew: user.autoRenew
    })
  } catch (e) {
    console.error('Error buying premium: ', e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.post('/user/:username/togglePremiumRenewal', async (req, res) => {
  try {
    const {username} = req.params;
    const {autoRenew} = req.body;

    const user = await userData.findOne({username});

    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.autoRenew = autoRenew
    await user.save();
    return res.json({
      message: "Auto renewal updated",
      autoRenew: user.autoRenew
    })
  } catch (e) {
    console.error('Error toggling premium renewal: ', e);
    return res.status(500).json({ error: "Server error" });
  }
})
app.get("/products-of-the-week", async (req, res) => {
  try {
    const randomPage = Math.floor(Math.random() * 20) + 1;

    const url =
      `https://world.openfoodfacts.org/cgi/search.pl` +
      `?search_terms=&json=1&page_size=20&page=${randomPage}` +
      `&tagtype_0=ecoscore_grade&tag_contains_0=contains&tag_0=a`;

    const r = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Scannit/1.0",
      },
    });

    const contentType = r.headers.get("content-type") || "";
    const bodyText = await r.text();

    console.log("POTW status:", r.status);
    console.log("POTW content-type:", contentType);
    console.log("POTW body preview:", bodyText.slice(0, 300));

    if (!contentType.includes("application/json")) {
      return res.status(502).json({
        error: "Unexpected response from Open Food Facts",
      });
    }

    const data = JSON.parse(bodyText);

    if (!data.products || !Array.isArray(data.products)) {
      return res.status(500).json({ error: "Products not found" });
    }

    const goodProducts = data.products.filter(
      (p) =>
        p._id &&
        p.product_name &&
        p.image_front_small_url &&
        p.ecoscore_grade &&
        p.ecoscore_score != null
    );

    const shuffled = goodProducts.sort(() => 0.5 - Math.random());
    const picks = shuffled.slice(0, 5);

    const formatted = picks.map((p) => ({
      id: p._id,
      product_name: p.product_name,
      imageUrl: p.image_front_small_url,
      ecoscore: p.ecoscore_score,
      ecoGrade: p.ecoscore_grade,
    }));

    return res.json(formatted);
  } catch (e) {
    console.error("Error getting products of the week: ", e);
    return res.status(500).json({ error: "Server error" });
  }
});
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
    await handlePremiumRenewal(user);
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