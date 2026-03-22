import path from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import seedProducts from "../data/products.js";
import logger from "../utils/logger.js";

const defaultPageSize = Number(process.env.PAGINATION_LIMIT) || 8;

const isDbConnected = () => mongoose.connection.readyState === 1;

const getFallbackProducts = () =>
  seedProducts.map((product, index) => ({
    ...product,
    _id: (index + 1).toString(16).padStart(24, "0"),
    reviews: product.reviews || [],
    sortOrder:
      typeof product.sortOrder === "number" ? product.sortOrder : index,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }));

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const pageSize = defaultPageSize;
  const page = Number(req.query.pageNumber) || 1;
  const keywordText = (req.query.keyword || "").toString().trim();

  logger.logRequest("GET", "/api/products", req, {
    page,
    keyword: keywordText || undefined,
  });

  if (!isDbConnected()) {
    logger.warn(
      "DATABASE",
      "MongoDB not connected, using fallback seed data for products",
    );
    const regex = keywordText ? new RegExp(keywordText, "i") : null;
    const filteredProducts = getFallbackProducts().filter((product) => {
      if (!regex) return true;
      return (
        regex.test(product.name) ||
        regex.test(product.brand) ||
        regex.test(product.category)
      );
    });

    filteredProducts.sort(
      (a, b) =>
        Number(b.featured || 0) - Number(a.featured || 0) ||
        Number(a.sortOrder || 0) - Number(b.sortOrder || 0) ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const startIndex = pageSize * (page - 1);
    const products = filteredProducts.slice(startIndex, startIndex + pageSize);
    const pages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

    const durationMs = Date.now() - startTime;
    logger.logSuccess("/api/products", 200, durationMs, {
      productsReturned: products.length,
      source: "fallback",
      page,
      pages,
    }, req);

    return res.json({ products, page, pages });
  }

  const keyword = keywordText
    ? {
        $or: [
          { name: { $regex: keywordText, $options: "i" } },
          { brand: { $regex: keywordText, $options: "i" } },
          { category: { $regex: keywordText, $options: "i" } },
        ],
      }
    : {};

  try {
    logger.logDb("count", "Product", { keyword: keywordText || "none" });
    const count = await Product.countDocuments({ ...keyword });

    logger.logDb("find", "Product", {
      page,
      pageSize,
      skip: pageSize * (page - 1),
      keyword: keywordText || "none",
    });

    const products = await Product.aggregate([
      { $match: { ...keyword } },
      {
        $addFields: {
          sortOrderSafe: { $ifNull: ["$sortOrder", 0] },
          featuredSafe: { $ifNull: ["$featured", false] },
        },
      },
      { $sort: { featuredSafe: -1, sortOrderSafe: 1, createdAt: -1 } },
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize },
    ]);

    // Clean up the extra fields we added for sorting
    const cleanedProducts = products.map((p) => {
      const { sortOrderSafe, featuredSafe, ...rest } = p;
      return {
        ...rest,
        sortOrder: sortOrderSafe,
        featured: featuredSafe,
      };
    });

    const pages = Math.ceil(count / pageSize);
    const durationMs = Date.now() - startTime;
    logger.logSuccess("/api/products", 200, durationMs, {
      productsReturned: cleanedProducts.length,
      page,
      pages,
      total: count,
    }, req);

    res.json({
      products: cleanedProducts,
      page,
      pages,
    });
  } catch (error) {
    logger.logError("GET_PRODUCTS", error, { page, keyword: keywordText });
    const products = getFallbackProducts().slice(0, pageSize);
    logger.warn("FALLBACK", "Product query failed, returning fallback data");
    res.json({ products, page: 1, pages: 1 });
  }
});

// @desc   Fetch a product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const productId = req.params.id;

  logger.logRequest("GET", `/api/products/${productId}`, req);

  if (!isDbConnected()) {
    logger.warn("DATABASE", "MongoDB not connected, using fallback seed data");
    const product = getFallbackProducts().find(
      (item) => item._id === productId,
    );

    if (product) {
      const durationMs = Date.now() - startTime;
      logger.logSuccess(`/api/products/${productId}`, 200, durationMs, {
        source: "fallback",
        productName: product.name,
      }, req);
      return res.json(product);
    }

    logger.warn("DATABASE", "Product not found in fallback data", {
      _id: productId,
    });
    res.status(404);
    throw new Error("Resource not found");
  }

  try {
    logger.logDb("findById", "Product", { _id: productId });
    const product = await Product.findById(productId).lean();

    if (product) {
      const durationMs = Date.now() - startTime;
      logger.logSuccess(`/api/products/${productId}`, 200, durationMs, {
        productName: product.name,
      }, req);
      return res.json(product);
    } else {
      logger.warn("DATABASE", "Product not found", { _id: productId });
      res.status(404);
      throw new Error("Resource not found");
    }
  } catch (error) {
    logger.logError("GET_PRODUCT_BY_ID", error, { productId });
    throw error;
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    image,
    brand,
    category,
    countInStock,
    sortOrder,
    featured = false,
    description,
  } = req.body;

  if (!name || !brand || !category || !description) {
    res.status(400);
    throw new Error("Name, brand, category, and description are required");
  }

  if (!Array.isArray(image) || image.length === 0) {
    res.status(400);
    throw new Error("At least one image is required");
  }

  const product = new Product({
    name,
    price: Number(price),
    user: req.user._id,
    image,
    brand,
    category,
    countInStock: Number(countInStock),
    sortOrder: Number(sortOrder || 0),
    featured: Boolean(featured),
    numReviews: 0,
    description,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin

const updateProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
    sortOrder,
    featured,
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;
    product.sortOrder = Number(sortOrder || 0);
    product.featured = Boolean(featured);

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const __dirname = path.resolve();

    // Iterate over all images in the product.image array
    for (const image of product.image) {
      if (image.startsWith("/uploads")) {
        const filePath = path.join(__dirname, image);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      }
    }

    await Product.deleteOne({ _id: product._id });
    res.status(200).json({ message: "Product and associated images deleted" });
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private

const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added" });
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc    Get featured products (falls back to top rated if none are featured)
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  const MIN = 3;

  if (!isDbConnected()) {
    const fallback = getFallbackProducts();
    const featured = fallback
      .filter((p) => p.featured)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    if (featured.length >= MIN) return res.status(200).json(featured);
    const featuredIds = new Set(featured.map((p) => p._id));
    const topRated = fallback
      .filter((p) => !featuredIds.has(p._id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, MIN - featured.length);
    return res.status(200).json([...featured, ...topRated]);
  }

  let products = [];

  try {
    const featured = await Product.find({ featured: true })
      .sort({ sortOrder: 1 })
      .lean();
    if (featured.length >= MIN) {
      products = featured;
    } else {
      const featuredIds = featured.map((p) => p._id);
      const topRated = await Product.find({ _id: { $nin: featuredIds } })
        .sort({ rating: -1 })
        .limit(MIN - featured.length)
        .lean();
      products = [...featured, ...topRated];
    }
  } catch (error) {
    products = getFallbackProducts()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, MIN);
  }

  res.status(200).json(products);
});

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
};
