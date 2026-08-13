
const express = require("express");

const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const upload = require("../middleware/upload");

const router = express.Router();

// ================================
// PUBLIC ROUTES
// ================================

// GET /api/products
router.get("/", getProducts);

// GET /api/products/:slug
router.get("/:slug", getProductBySlug);

// ================================
// ADMIN ROUTES
// ================================

// POST /api/products
router.post("/", upload.single("image"), createProduct);

// PUT /api/products/:id
router.put("/:id", upload.single("image"), updateProduct);

// DELETE /api/products/:id
router.delete("/:id", deleteProduct);

module.exports = router;

