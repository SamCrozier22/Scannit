const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

console.log("Starting script...");

const products = require("../data/POTWs.json");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "GrazeGood/1.0 (student project)",
      },
    });

    const text = await res.text();

    if (text.trim().startsWith("{")) {
      return JSON.parse(text);
    }

    console.log(`${url} Not JSON, retrying in 5s... attempt ${attempt + 1}`);
    await sleep(5000);
  }

  return null;
}

async function enrichProducts() {
  const enriched = [];

  for (const product of products) {
    const query = encodeURIComponent(`${product.product_name} ${product.brands}`);
    const url =
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}` +
      `&json=1&page_size=5`;

    const data = await fetchJson(url);

    if (!data) {
      console.log(`Skipped ${product.product_name}: still not JSON`);
      enriched.push(product);
      continue;
    }

    const match = data.products?.find(
      (p) => p.product_name && p.image_front_small_url
    );

    enriched.push({
      ...product,
      barcode: match?._id ?? product.barcode ?? "",
      imageUrl: match?.image_front_small_url ?? product.imageUrl ?? "",
    });

    console.log(`Done: ${product.product_name}`);
    await sleep(4000);
  }

  const filePath = path.join(__dirname, "../data/POTWs.enriched.json");
  fs.writeFileSync(filePath, JSON.stringify(enriched, null, 2));

  console.log("Created file:", filePath);
}

enrichProducts();