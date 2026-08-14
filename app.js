const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const productRoutes = require("./routes/product.routes");

const app = express();

const allowedOrigins = [
  "https://frontend-8oc4.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from Postman/server-side clients
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked origin: ${origin}`)
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Rajdhani Dry Food API is running",
  });
});

// Root
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