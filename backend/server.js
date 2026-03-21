import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import galleryProjectRoutes from "./routes/galleryProjectRoutes.js";

const port = process.env.PORT || 5000;

connectDB(); // Connect to MongoDB

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware
app.use(cookieParser());

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/galleryprojects", galleryProjectRoutes);

app.get("/api/config/paypal", (req, res) =>
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID })
);

const __dirname = path.resolve(); // Set __dirname to current directory
app.use("/uploads", express.static(path.join(__dirname, "/uploads"), { maxAge: "7d" }));

if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "/frontend/build"), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          // index.html must never be cached so users always get fresh JS/CSS references
          res.setHeader("Cache-Control", "no-cache");
        } else if (filePath.includes("/static/")) {
          // Hashed filenames: safe to cache for 1 year
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running....");
  });
}

app.use(notFound);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
// Prevent premature 502s on platforms like Render
server.keepAliveTimeout = 120000;
server.headersTimeout = 121000;
