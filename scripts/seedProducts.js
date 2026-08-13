const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");


dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

const products = require("../data/products");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const IMAGE_DIRECTORY = path.resolve(
  __dirname,
  "../../client/public/products"
);

async function seedProducts() {
  try {
    // -----------------------------
    // Environment check
    // -----------------------------

    console.log("\nChecking configuration...\n");

    console.log(
      "MONGO_URI:",
      process.env.MONGO_URI ? "✓ Found" : "✗ Missing"
    );

    console.log(
      "Cloudinary Cloud Name:",
      process.env.CLOUDINARY_CLOUD_NAME
        ? "✓ Found"
        : "✗ Missing"
    );

    console.log(
      "Cloudinary API Key:",
      process.env.CLOUDINARY_API_KEY
        ? "✓ Found"
        : "✗ Missing"
    );

    console.log(
      "Cloudinary API Secret:",
      process.env.CLOUDINARY_API_SECRET
        ? "✓ Found"
        : "✗ Missing"
    );

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    // -----------------------------
    // Image directory
    // -----------------------------

    console.log("\nImage directory:");
    console.log(IMAGE_DIRECTORY);

    if (!fs.existsSync(IMAGE_DIRECTORY)) {
      throw new Error(
        `Image directory does not exist:\n${IMAGE_DIRECTORY}`
      );
    }

    console.log("✓ Image directory exists");

    // -----------------------------
    // Connect MongoDB
    // -----------------------------

    console.log("\nConnecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✓ MongoDB connected\n");

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // -----------------------------
    // Products
    // -----------------------------

    for (const productData of products) {
      console.log("--------------------------------");
      console.log(`Processing: ${productData.name}`);

      try {
        // Get only filename
        const fileName = path.basename(productData.image);

        const imagePath = path.join(
          IMAGE_DIRECTORY,
          fileName
        );

        console.log("Image file:", fileName);
        console.log("Full path:", imagePath);

        // Check image
        if (!fs.existsSync(imagePath)) {
          throw new Error(
            `IMAGE NOT FOUND: ${imagePath}`
          );
        }

        console.log("✓ Image exists");

        // -----------------------------
        // Category
        // -----------------------------

        console.log(
          "Looking for category:",
          productData.category
        );

        const category = await Category.findOne({
          name: productData.category,
        });

        if (!category) {
          throw new Error(
            `CATEGORY NOT FOUND: ${productData.category}`
          );
        }

        console.log(
          `✓ Category found: ${category.name}`
        );

        // -----------------------------
        // Cloudinary
        // -----------------------------

        console.log("Uploading to Cloudinary...");

        const uploaded = await cloudinary.uploader.upload(
          imagePath,
          {
            folder: "rajdhani-dry-food/products",
            public_id: productData.slug,
            overwrite: true,
            resource_type: "image",
          }
        );

        console.log("✓ Cloudinary upload successful");

        console.log(
          "URL:",
          uploaded.secure_url
        );

        // -----------------------------
        // Product
        // -----------------------------

        const product = {
          name: productData.name,
          slug: productData.slug,
          category: category._id,
          description: productData.description,
          image: uploaded.secure_url,
          isActive: true,
          featured: false,
        };

        // -----------------------------
        // Create / update
        // -----------------------------

        const existing = await Product.findOne({
          slug: productData.slug,
        });

        if (existing) {
          await Product.findOneAndUpdate(
            { slug: productData.slug },
            product,
            {
              new: true,
              runValidators: true,
            }
          );

          console.log("✓ Product updated");
          updated++;
        } else {
          await Product.create(product);

          console.log("✓ Product created");
          created++;
        }
      } catch (error) {
        console.error("\n✗ PRODUCT FAILED");
        console.error("Reason:", error.message);

        skipped++;
      }
    }

    // -----------------------------
    // Summary
    // -----------------------------

    console.log("\n====================================");
    console.log("Product seed completed");
    console.log("====================================");
    console.log(`Created : ${created}`);
    console.log(`Updated : ${updated}`);
    console.log(`Skipped : ${skipped}`);
    console.log(`Total   : ${products.length}`);
    console.log("====================================\n");
  } catch (error) {
    console.error("\n✗ SEEDER FAILED");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("✓ MongoDB disconnected");
    }
  }
}

seedProducts();