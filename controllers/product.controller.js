const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

// ========================================
// GET ALL PRODUCTS
// GET /api/products
// ========================================

const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      isActive: true,
    };

    // ========================================
    // CATEGORY FILTER
    // ========================================

    if (category) {
      const categoryDoc = await Category.findOne({
        slug: category,
        isActive: true,
      }).select("_id");

      // Category does not exist
      if (!categoryDoc) {
        return res.status(200).json({
          success: true,
          products: [],
          pagination: {
            page: 1,
            limit: Number(limit),
            total: 0,
            pages: 0,
          },
        });
      }

      filter.category = categoryDoc._id;
    }

    // ========================================
    // SEARCH FILTER
    // ========================================

    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    // ========================================
    // PAGINATION
    // ========================================

    const pageNumber = Math.max(Number(page) || 1, 1);

    const limitNumber = Math.min(
      Math.max(Number(limit) || 12, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    // ========================================
    // FETCH PRODUCTS
    // ========================================

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Product.countDocuments(filter),
    ]);

    // ========================================
    // RESPONSE
    // ========================================

    res.status(200).json({
      success: true,
      products,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber),
      },
    });

  } catch (error) {
    next(error);
  }
};
// ========================================
// GET PRODUCT BY SLUG
// GET /api/products/:slug
// ========================================

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// CREATE PRODUCT
// POST /api/products
// ========================================

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      category,
      description,
      featured,
    } = req.body;

    if (!name || !slug || !category || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Name, slug, category and description are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const product = await Product.create({
      name,
      slug,
      category,
      description,
      featured:
        featured === "true" || featured === true,
      image: req.file.path,
    });

    const populatedProduct = await product.populate(
      "category",
      "name slug"
    );

    res.status(201).json({
      success: true,
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ========================================

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      name,
      slug,
      category,
      description,
      featured,
      isActive,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (slug !== undefined) product.slug = slug;
    if (category !== undefined) product.category = category;
    if (description !== undefined) {
      product.description = description;
    }

    if (featured !== undefined) {
      product.featured =
        featured === "true" || featured === true;
    }

    if (isActive !== undefined) {
      product.isActive =
        isActive === "true" || isActive === true;
    }

    if (req.file) {
      product.image = req.file.path;
    }

    await product.save();

    const populatedProduct = await product.populate(
      "category",
      "name slug"
    );

    res.status(200).json({
      success: true,
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ========================================

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};