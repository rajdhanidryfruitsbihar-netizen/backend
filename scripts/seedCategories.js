
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Category = require("../models/Category");

// --------------------------------------------------
// Environment Configuration
// --------------------------------------------------

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

// --------------------------------------------------
// Category Data
// --------------------------------------------------

const CATEGORIES = [
  {
    name: "Dates",
    slug: "dates",
    description: "Premium dates and date varieties.",
  },
  {
    name: "Dry Fruits",
    slug: "dry-fruits",
    description: "Premium dried fruits.",
  },
  {
    name: "Nuts",
    slug: "nuts",
    description: "Premium nuts and kernels.",
  },
  {
    name: "Stuffed Dates",
    slug: "stuffed-dates",
    description: "Dates filled with premium nuts.",
  },
  {
    name: "Chocolate Dates",
    slug: "chocolate-dates",
    description: "Premium chocolate-covered dates.",
  },
  {
    name: "Bakery Items",
    slug: "bakery-items",
    description: "Fresh bakery products.",
  },
];

// --------------------------------------------------
// Database Connection
// --------------------------------------------------

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is not defined. Please check your server/.env file."
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("✓ MongoDB connected");
};

// --------------------------------------------------
// Seed Categories
// --------------------------------------------------

const seedCategories = async () => {
  try {
    console.log("\n🌱 Starting category seed...\n");

    await connectDatabase();

    for (const category of CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: category.slug },
        category,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      console.log(`✓ Seeded: ${category.name}`);
    }

    console.log("\n✓ Categories seeded successfully");
  } catch (error) {
    console.error("\n✗ Category seed failed");
    console.error(`Error: ${error.message}`);

    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("✓ MongoDB disconnected");
    }
  }
};

// --------------------------------------------------
// Run Seeder
// --------------------------------------------------

seedCategories();
