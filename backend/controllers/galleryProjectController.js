import path from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import GalleryProject from "../models/galleryProjectModel.js";

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Fetch all gallery projects
// @route   GET /api/galleryprojects
// @access  Public
const getGalleryProjects = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    return res.json([]);
  }

  const projects = await GalleryProject.find({})
    .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
    .lean();

  res.json(projects);
});

// @desc    Fetch gallery project by id
// @route   GET /api/galleryprojects/:id
// @access  Public
const getGalleryProjectById = asyncHandler(async (req, res) => {
  if (!isDbConnected()) {
    res.status(404);
    throw new Error("Gallery project not found");
  }

  const project = await GalleryProject.findById(req.params.id).lean();

  if (!project) {
    res.status(404);
    throw new Error("Gallery project not found");
  }

  res.json(project);
});

// @desc    Create a gallery project
// @route   POST /api/galleryprojects
// @access  Private/Admin
const createGalleryProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    completedAt,
    featured = false,
    sortOrder = 0,
    images = [],
  } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error("Title and description are required");
  }

  if (!Array.isArray(images) || images.length === 0) {
    res.status(400);
    throw new Error("At least one image is required");
  }

  const project = new GalleryProject({
    user: req.user._id,
    title,
    description,
    category,
    completedAt: completedAt || undefined,
    featured,
    sortOrder,
    images,
  });

  const createdProject = await project.save();
  res.status(201).json(createdProject);
});

// @desc    Update a gallery project
// @route   PUT /api/galleryprojects/:id
// @access  Private/Admin
const updateGalleryProject = asyncHandler(async (req, res) => {
  const project = await GalleryProject.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Gallery project not found");
  }

  const {
    title,
    description,
    category,
    completedAt,
    featured,
    sortOrder,
    images,
  } = req.body;

  project.title = title ?? project.title;
  project.description = description ?? project.description;
  project.category = category ?? project.category;
  project.completedAt = completedAt || undefined;
  project.featured =
    typeof featured === "boolean" ? featured : Boolean(project.featured);
  project.sortOrder =
    typeof sortOrder === "number" ? sortOrder : Number(project.sortOrder || 0);

  if (Array.isArray(images) && images.length > 0) {
    project.images = images;
  }

  const updatedProject = await project.save();
  res.json(updatedProject);
});

// @desc    Delete a gallery project
// @route   DELETE /api/galleryprojects/:id
// @access  Private/Admin
const deleteGalleryProject = asyncHandler(async (req, res) => {
  const project = await GalleryProject.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Gallery project not found");
  }

  const __dirname = path.resolve();

  for (const image of project.images || []) {
    if (!image.startsWith("/uploads")) {
      continue;
    }

    const filePath = path.join(__dirname, image);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  await GalleryProject.deleteOne({ _id: project._id });
  res.json({ message: "Gallery project deleted" });
});

export {
  getGalleryProjects,
  getGalleryProjectById,
  createGalleryProject,
  updateGalleryProject,
  deleteGalleryProject,
};
