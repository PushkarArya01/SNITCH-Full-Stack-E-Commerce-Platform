import "dotenv/config";
import mongoose from "mongoose";

import productModel from "../src/models/product.model.js";
import userModel from "../src/models/user.model.js";
import { uploadFile } from "../src/services/storage.service.js";
import { products } from "./products.js";

const MONGO_URI = process.env.MONGO_URI;
const sellerEmail = process.env.SEED_SELLER_EMAIL;

const IMAGE_SOURCES = {
  'Classic Oxford Shirt': 'https://images.pexels.com/photos/34966923/pexels-photo-34966923.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Premium Cuban Collar Shirt': 'https://images.pexels.com/photos/6615612/pexels-photo-6615612.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Textured Resort Shirt': 'https://images.pexels.com/photos/16640185/pexels-photo-16640185.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Linen Blend Shirt': 'https://images.pexels.com/photos/29012316/pexels-photo-29012316.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Striped Casual Shirt': 'https://images.pexels.com/photos/20885704/pexels-photo-20885704.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Relaxed Camp Collar Shirt': 'https://images.pexels.com/photos/10331645/pexels-photo-10331645.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Premium Check Shirt': 'https://images.pexels.com/photos/19266863/pexels-photo-19266863.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Solid Overshirt': 'https://images.pexels.com/photos/15113941/pexels-photo-15113941.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Essential Black Tee': 'https://images.pexels.com/photos/18279570/pexels-photo-18279570.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Heavyweight White Tee': 'https://images.pexels.com/photos/19437841/pexels-photo-19437841.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Graphic Street Tee': 'https://images.pexels.com/photos/18874175/pexels-photo-18874175.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Minimal Logo Tee': 'https://images.pexels.com/photos/19381379/pexels-photo-19381379.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Essential Grey Tee': 'https://images.pexels.com/photos/16701781/pexels-photo-16701781.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Studio Black Tee': 'https://images.pexels.com/photos/8187670/pexels-photo-8187670.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Graphic Print Tee': 'https://images.pexels.com/photos/27348270/pexels-photo-27348270.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Urban Street Tee': 'https://images.pexels.com/photos/14428674/pexels-photo-14428674.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Relaxed Cargo Pants': 'https://images.pexels.com/photos/5366340/pexels-photo-5366340.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Straight Fit Denim': 'https://images.pexels.com/photos/20240684/pexels-photo-20240684.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Utility Trousers': 'https://images.pexels.com/photos/18752723/pexels-photo-18752723.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Wide Leg Pants': 'https://images.pexels.com/photos/31068182/pexels-photo-31068182.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Classic Black Jeans': 'https://images.pexels.com/photos/8915349/pexels-photo-8915349.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Grey Denim Cargo Pants': 'https://images.pexels.com/photos/19461556/pexels-photo-19461556.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Printed Wide Pants': 'https://images.pexels.com/photos/19464066/pexels-photo-19464066.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Classic Blue Jeans': 'https://images.pexels.com/photos/15338665/pexels-photo-15338665.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Drop Shoulder Oversized Tee': 'https://images.pexels.com/photos/37066864/pexels-photo-37066864.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Washed Oversized Hoodie': 'https://images.pexels.com/photos/15360023/pexels-photo-15360023.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Streetwear Oversized Shirt': 'https://images.pexels.com/photos/28758239/pexels-photo-28758239.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Heavyweight Oversized Tee': 'https://images.pexels.com/photos/13833037/pexels-photo-13833037.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Oversized Graphic Tee': 'https://images.pexels.com/photos/19982386/pexels-photo-19982386.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Urban Oversized Hoodie': 'https://images.pexels.com/photos/14888314/pexels-photo-14888314.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Black Street Hoodie': 'https://images.pexels.com/photos/32430590/pexels-photo-32430590.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Graphic Oversized Hoodie': 'https://images.pexels.com/photos/18657721/pexels-photo-18657721.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Premium Satin Shirt': 'https://images.pexels.com/photos/14197706/pexels-photo-14197706.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Signature Luxe Jacket': 'https://images.pexels.com/photos/14391921/pexels-photo-14391921.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Premium Textured Polo': 'https://images.pexels.com/photos/13439444/pexels-photo-13439444.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Luxe Black Bomber': 'https://images.pexels.com/photos/26761831/pexels-photo-26761831.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Premium Resort Shirt': 'https://images.pexels.com/photos/6050413/pexels-photo-6050413.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Luxury Black Blazer': 'https://images.pexels.com/photos/7713129/pexels-photo-7713129.jpeg?auto=compress&cs=tinysrgb&w=1200',
'Luxe Blue Blazer': 'https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=1200',  'Signature Tailored Suit': 'https://images.pexels.com/photos/14378602/pexels-photo-14378602.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Black Shirt & Trouser Co-ord': 'https://images.pexels.com/photos/13069419/pexels-photo-13069419.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Relaxed Summer Co-ord': 'https://images.pexels.com/photos/13069431/pexels-photo-13069431.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Street Utility Co-ord': 'https://images.pexels.com/photos/9488413/pexels-photo-9488413.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Monochrome Resort Co-ord': 'https://images.pexels.com/photos/5080654/pexels-photo-5080654.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Minimal Beige Co-ord': 'https://images.pexels.com/photos/5080684/pexels-photo-5080684.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Floral Resort Co-ord': 'https://images.pexels.com/photos/5080677/pexels-photo-5080677.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Clean White Co-ord': 'https://images.pexels.com/photos/10617843/pexels-photo-10617843.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Holiday Linen Co-ord': 'https://images.pexels.com/photos/32518994/pexels-photo-32518994.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Urban Night Eau de Parfum': 'https://images.pexels.com/photos/1961792/pexels-photo-1961792.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Signature Noir Eau de Parfum': 'https://images.pexels.com/photos/7814722/pexels-photo-7814722.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Midnight Oud Eau de Parfum': 'https://images.pexels.com/photos/17810095/pexels-photo-17810095.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Fresh Citrus Eau de Parfum': 'https://images.pexels.com/photos/10688062/pexels-photo-10688062.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Ocean Mist Eau de Parfum': 'https://images.pexels.com/photos/10413737/pexels-photo-10413737.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Velvet Amber Eau de Parfum': 'https://images.pexels.com/photos/30990135/pexels-photo-30990135.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Classic Cologne Eau de Parfum': 'https://images.pexels.com/photos/9202849/pexels-photo-9202849.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Pure White Eau de Parfum': 'https://images.pexels.com/photos/1653085/pexels-photo-1653085.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function downloadImage(url, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154 Safari/537.36",
          Accept: "image/avif,image/webp,image/apng,image/jpeg,image/*,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("image/")) {
        throw new Error(`Invalid content type: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      if (!arrayBuffer.byteLength) {
        throw new Error("Downloaded image is empty");
      }

      return Buffer.from(arrayBuffer);
    } catch (error) {
      lastError = error;
      console.log(`  ⚠ Download attempt ${attempt}/${retries} failed: ${error.message}`);

      if (attempt < retries) {
        await sleep(1000);
      }
    }
  }

  throw lastError;
}

async function uploadProductImage(product, productIndex) {
  const sourceUrl = IMAGE_SOURCES[product.title];

  if (!sourceUrl) {
    throw new Error(`No image source configured for: ${product.title}`);
  }

  console.log(`  Source: ${sourceUrl}`);
  console.log("  Downloading...");

  const buffer = await downloadImage(sourceUrl);

  const safeTitle = product.title
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const fileName =
    `catalog-${String(productIndex + 1).padStart(3, "0")}-${safeTitle}.jpg`;

  console.log("  Uploading to ImageKit...");

  const uploaded = await uploadFile({
    buffer,
    fileName,
  });

  const imageUrl =
    uploaded?.url ||
    uploaded?.thumbnailUrl ||
    uploaded?.filePath;

  if (!imageUrl) {
    throw new Error("ImageKit upload succeeded but no image URL was returned");
  }

  console.log("  ✓ Image uploaded");

  return imageUrl;
}

function validateCatalog() {
  const expectedCategories = {
    shirts: 8,
    "t-shirts": 8,
    bottoms: 8,
    oversized: 8,
    luxe: 8,
    "co-ords": 8,
    perfumes: 8,
  };

  if (products.length !== 56) {
    throw new Error(`Expected 56 products, found ${products.length}`);
  }

  const counts = {};
  const titles = new Set();
  const imageSources = new Set();

  for (const product of products) {
    counts[product.category] = (counts[product.category] || 0) + 1;

    if (titles.has(product.title)) {
      throw new Error(`Duplicate product title: ${product.title}`);
    }
    titles.add(product.title);

    const source = IMAGE_SOURCES[product.title];

    if (!source) {
      throw new Error(`Missing image source for: ${product.title}`);
    }

    if (imageSources.has(source)) {
      throw new Error(`Repeated image source detected: ${source}`);
    }
    imageSources.add(source);
  }

  for (const [category, expected] of Object.entries(expectedCategories)) {
    if (counts[category] !== expected) {
      throw new Error(
        `Category ${category} must have ${expected} products, found ${counts[category] || 0}`
      );
    }
  }

  console.log("✓ Catalog validation passed");
  console.log("✓ 7 categories × 8 products = 56 products");
  console.log("✓ 1 unique source image per product");
}

async function prepareProducts() {
  const prepared = [];

  for (let productIndex = 0; productIndex < products.length; productIndex++) {
    const product = products[productIndex];

    console.log("");
    console.log(
      `[${productIndex + 1}/${products.length}] ${product.title} (${product.category})`
    );

    const imageUrl = await uploadProductImage(product, productIndex);

    prepared.push({
      ...product,
      images: [imageUrl],
      published: true,
    });

    await sleep(250);
  }

  return prepared;
}

async function run() {
  try {
    validateCatalog();

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    if (!sellerEmail) {
      throw new Error("SEED_SELLER_EMAIL is missing in .env");
    }

    await mongoose.connect(MONGO_URI);

    console.log("");
    console.log("MongoDB connected successfully");
    console.log(`Seller email: ${sellerEmail}`);

    const seller = await userModel.findOne({
      email: sellerEmail,
      role: "seller",
    });

    if (!seller) {
      throw new Error(`Seller not found for email: ${sellerEmail}`);
    }

    console.log(`Seller ID: ${seller._id}`);

    console.log("");
    console.log("Preparing 56 unique catalog images...");
    console.log("IMPORTANT: Old products will NOT be deleted until all uploads succeed.");

    const preparedProducts = await prepareProducts();

    console.log("");
    console.log("✓ All 56 ImageKit uploads completed successfully.");
    console.log("Replacing old seller catalog...");

    const deleted = await productModel.deleteMany({
      seller: seller._id,
    });

    console.log(`Removed ${deleted.deletedCount} old products.`);

    const docs = preparedProducts.map((product) => ({
      ...product,
      seller: seller._id,
      published: true,
    }));

    const inserted = await productModel.insertMany(docs);

    const counts = {};

    inserted.forEach((product) => {
      counts[product.category] =
        (counts[product.category] || 0) + 1;
    });

    console.log("");
    console.log("========================================");
    console.log("SNITCH PRODUCT SEED COMPLETED");
    console.log("========================================");
    console.log(`Total products: ${inserted.length}`);
    console.log("Images per product: 1");
    console.log("Unique image sources: 56");
    console.log("");
    console.log("Category counts:");
    Object.entries(counts).forEach(([category, count]) => {
      console.log(`- ${category}: ${count}`);
    });
    console.log("========================================");
  } catch (error) {
    console.error("");
    console.error("❌ Product seed failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
