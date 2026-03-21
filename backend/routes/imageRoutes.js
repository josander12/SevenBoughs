import path from "path";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import express from "express";
import sharp from "sharp";

const router = express.Router();
const uploadsDir = path.resolve("uploads");
const cacheDir = path.join(uploadsDir, ".cache");

const getSafeUploadPath = (src) => {
  if (!src || !src.startsWith("/uploads/")) {
    return null;
  }

  const relativePath = src.replace(/^\/uploads\//, "");
  const sourcePath = path.resolve(uploadsDir, relativePath);

  if (!sourcePath.startsWith(`${uploadsDir}${path.sep}`) && sourcePath !== uploadsDir) {
    return null;
  }

  return {
    relativePath,
    sourcePath,
  };
};

router.get("/", async (req, res, next) => {
  try {
    const src = req.query.src?.toString();
    const width = Math.min(Math.max(Number(req.query.w) || 800, 80), 2400);
    const quality = Math.min(Math.max(Number(req.query.q) || 82, 40), 95);

    const safePath = getSafeUploadPath(src);

    if (!safePath) {
      res.status(400);
      throw new Error("Invalid image source");
    }

    if (!existsSync(safePath.sourcePath)) {
      res.status(404);
      throw new Error("Image not found");
    }

    const cacheFileName = `${safePath.relativePath.replace(/[\\/]/g, "_")}-w${width}-q${quality}.webp`;
    const cachePath = path.join(cacheDir, cacheFileName);

    await mkdir(cacheDir, { recursive: true });

    if (existsSync(cachePath)) {
      const cached = await readFile(cachePath);
      res.setHeader("Content-Type", "image/webp");
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      return res.send(cached);
    }

    const optimizedBuffer = await sharp(safePath.sourcePath)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    await writeFile(cachePath, optimizedBuffer);

    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(optimizedBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;