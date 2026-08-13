const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const productRoutes = require("./routes/product.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Rajdhani Dry Food API is running",
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Rajdhani Dry Food API");
});

// Product routes
app.use("/api/products", productRoutes);

// Error handler
app.use((error, req, res, next) => {
  console.error("ERROR:", error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

module.exports = app;