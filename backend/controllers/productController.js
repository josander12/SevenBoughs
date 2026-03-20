import path from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";
import seedProducts from "../data/products.js";

const defaultPageSize = Number(process.env.PAGINATION_LIMIT) || 8;

const isDbConnected = () => mongoose.connection.readyState === 1;

const getFallbackProducts = () =>
  seedProducts.map((product, index) => ({
    ...product,
    _id: (index + 1).toString(16).padStart(24, "0"),
    reviews: product.reviews || [],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
  }));

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = defaultPageSize;
  const page = Number(req.query.pageNumber) || 1;
  const keywordText = (req.query.keyword || "").toString().trim();

  if (!isDbConnected()) {
    const regex = keywordText ? new RegExp(keywordText, "i") : null;
    const filteredProducts = getFallbackProducts().filter((product) => {
      if (!regex) return true;
      return (
        regex.test(product.name) ||
        regex.test(product.brand) ||
        regex.test(product.category)
      );
    });

    const startIndex = pageSize * (page - 1);
    const products = filteredProducts.slice(startIndex, startIndex + pageSize);
    const pages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

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
    const count = await Product.countDocuments({ ...keyword });

    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    const products = getFallbackProducts().slice(0, pageSize);
    res.json({ products, page: 1, pages: 1 });
  }
});

// @desc   Fetch a product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const product = getFallbackProducts().find((item) => item._id === req.params.id);

    if (product) {
      return res.json(product);
    }

    res.status(404);
    throw new Error("Resource not found");
  }

  const product = await Product.findById(req.params.id);

  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error("Resource not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: "Sample Name",
    price: 0,
    user: req.user._id,
    image: ["/images/sample.jpg"],
    brand: "Sample brand",
    category: "Sample category",
    countInStock: 0,
    numReviews: 0,
    description: "Sample description",
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

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
      (review) => review.user.toString() === req.user._id.toString()
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

// @desc    Get top rated products
// @route   GET /api/products/top
// @access  Public
const getTopProducts = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    const products = getFallbackProducts()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
    return res.status(200).json(products);
  }

  let products = [];

  try {
    products = await Product.find({}).sort({ rating: -1 }).limit(3);
  } catch (error) {
    products = getFallbackProducts()
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
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
