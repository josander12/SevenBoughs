import path from "path";
import { existsSync } from "fs";
import { unlink } from "fs/promises";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import GalleryProject from "../models/galleryProjectModel.js";
import logger from "../utils/logger.js";

const defaultPageSize = Number(process.env.PAGINATION_LIMIT) || 6;

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Fetch all gallery projects with pagination
// @route   GET /api/galleryprojects
// @access  Public
const getGalleryProjects = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const requestedSize = Number(req.query.pageSize);
  const pageSize =
    requestedSize > 0 && requestedSize <= 50 ? requestedSize : defaultPageSize;
  const page = Number(req.query.pageNumber) || 1;
  const keywordFilter = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: "i" } },
          { category: { $regex: req.query.keyword, $options: "i" } },
          { description: { $regex: req.query.keyword, $options: "i" } },
        ],
      }
    : {};

  logger.logRequest("GET", "/api/galleryprojects", req, {
    pageNumber: page,
    keyword: req.query.keyword,
  });

  if (!isDbConnected()) {
    logger.warn(
      "DATABASE",
      "MongoDB not connected, returning empty projects list",
    );
    return res.json({
      projects: [],
      page: 1,
      pages: 1,
      total: 0,
    });
  }

  try {
    logger.logDb("count", "GalleryProject", {
      description: "Counting total gallery projects",
    });

    const total = await GalleryProject.countDocuments(keywordFilter);

    logger.logDb("find", "GalleryProject", {
      page,
      pageSize,
      skip: pageSize * (page - 1),
    });

    const projects = await GalleryProject.find(keywordFilter)
      .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .lean();

    const pages = Math.ceil(total / pageSize);

    const durationMs = Date.now() - startTime;
    logger.logSuccess("/api/galleryprojects", 200, durationMs, {
      projectsReturned: projects.length,
      page,
      pages,
      total,
    }, req);

    res.json({
      projects,
      page,
      pages,
      total,
    });
  } catch (error) {
    logger.logError("GET_GALLERY_PROJECTS", error, {
      page,
      pageSize,
    });
    throw error;
  }
});

// @desc    Fetch gallery project by id
// @route   GET /api/galleryprojects/:id
// @access  Public
const getGalleryProjectById = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const projectId = req.params.id;

  logger.logRequest("GET", `/api/galleryprojects/${projectId}`, req);

  if (!isDbConnected()) {
    logger.warn("DATABASE", "MongoDB not connected, cannot retrieve project");
    res.status(404);
    throw new Error("Gallery project not found");
  }

  try {
    logger.logDb("findById", "GalleryProject", { _id: projectId });

    const project = await GalleryProject.findById(projectId).lean();

    if (!project) {
      logger.warn("DATABASE", "Gallery project not found", { _id: projectId });
      res.status(404);
      throw new Error("Gallery project not found");
    }

    const durationMs = Date.now() - startTime;
    logger.logSuccess(`/api/galleryprojects/${projectId}`, 200, durationMs, {
      projectTitle: project.title,
    }, req);

    res.json(project);
  } catch (error) {
    logger.logError("GET_GALLERY_PROJECT_BY_ID", error, { projectId });
    throw error;
  }
});

// @desc    Create a gallery project
// @route   POST /api/galleryprojects
// @access  Private/Admin
const createGalleryProject = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const {
    title,
    description,
    category,
    completedAt,
    featured = false,
    sortOrder = 0,
    images = [],
  } = req.body;

  logger.logRequest("POST", "/api/galleryprojects", req);

  // Validation
  if (!title || !description) {
    logger.logValidation("CREATE_GALLERY_PROJECT", [
      "Title is required",
      "Description is required",
    ]);
    res.status(400);
    throw new Error("Title and description are required");
  }

  if (!Array.isArray(images) || images.length === 0) {
    logger.logValidation("CREATE_GALLERY_PROJECT", [
      "At least one image is required",
    ]);
    res.status(400);
    throw new Error("At least one image is required");
  }

  try {
    logger.logDb("create", "GalleryProject", {
      title,
      category,
      imageCount: images.length,
      featured,
      sortOrder,
    });

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

    const durationMs = Date.now() - startTime;
    logger.logSuccess("/api/galleryprojects", 201, durationMs, {
      projectId: createdProject._id,
      projectTitle: createdProject.title,
    }, req);

    res.status(201).json(createdProject);
  } catch (error) {
    logger.logError("CREATE_GALLERY_PROJECT", error, {
      title,
      imageCount: images.length,
    });
    throw error;
  }
});

// @desc    Update a gallery project
// @route   PUT /api/galleryprojects/:id
// @access  Private/Admin
const updateGalleryProject = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const projectId = req.params.id;
  const {
    title,
    description,
    category,
    completedAt,
    featured,
    sortOrder,
    images,
  } = req.body;

  logger.logRequest(
    "PUT",
    `/api/galleryprojects/${projectId}`,
    req,
  );

  try {
    logger.logDb("findById", "GalleryProject", { _id: projectId });

    const project = await GalleryProject.findById(projectId);

    if (!project) {
      logger.warn("DATABASE", "Gallery project not found for update", {
        _id: projectId,
      });
      res.status(404);
      throw new Error("Gallery project not found");
    }

    const originalValues = {
      title: project.title,
      featured: project.featured,
      sortOrder: project.sortOrder,
    };

    project.title = title ?? project.title;
    project.description = description ?? project.description;
    project.category = category ?? project.category;
    project.completedAt = completedAt || undefined;
    project.featured =
      typeof featured === "boolean" ? featured : Boolean(project.featured);
    project.sortOrder =
      typeof sortOrder === "number"
        ? sortOrder
        : Number(project.sortOrder || 0);

    if (Array.isArray(images) && images.length > 0) {
      project.images = images;
    }

    logger.logDb("update", "GalleryProject", {
      _id: projectId,
      changes: {
        titleChanged: originalValues.title !== project.title,
        featuredChanged: originalValues.featured !== project.featured,
        sortOrderChanged: originalValues.sortOrder !== project.sortOrder,
        imageCountChanged: project.images?.length,
      },
    });

    const updatedProject = await project.save();

    const durationMs = Date.now() - startTime;
    logger.logSuccess(`/api/galleryprojects/${projectId}`, 200, durationMs, {
      projectTitle: updatedProject.title,
    }, req);

    res.json(updatedProject);
  } catch (error) {
    logger.logError("UPDATE_GALLERY_PROJECT", error, { projectId });
    throw error;
  }
});

// @desc    Delete a gallery project
// @route   DELETE /api/galleryprojects/:id
// @access  Private/Admin
const deleteGalleryProject = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const projectId = req.params.id;

  logger.logRequest(
    "DELETE",
    `/api/galleryprojects/${projectId}`,
    req,
  );

  try {
    logger.logDb("findById", "GalleryProject", { _id: projectId });

    const project = await GalleryProject.findById(projectId);

    if (!project) {
      logger.warn("DATABASE", "Gallery project not found for deletion", {
        _id: projectId,
      });
      res.status(404);
      throw new Error("Gallery project not found");
    }

    const __dirname = path.resolve();
    let deletedImageCount = 0;

    for (const image of project.images || []) {
      if (!image.startsWith("/uploads")) {
        continue;
      }

      const filePath = path.join(__dirname, image);
      if (existsSync(filePath)) {
        try {
          await unlink(filePath);
          deletedImageCount++;
          logger.debug("FILE_SYSTEM", `Deleted image file: ${image}`);
        } catch (fileError) {
          logger.warn("FILE_SYSTEM", `Failed to delete image file: ${image}`, {
            error: fileError?.message,
          });
        }
      }
    }

    logger.logDb("delete", "GalleryProject", {
      _id: projectId,
      projectTitle: project.title,
      deletedImageCount,
      totalImageCount: project.images?.length || 0,
    });

    await GalleryProject.deleteOne({ _id: projectId });

    const durationMs = Date.now() - startTime;
    logger.logSuccess(`/api/galleryprojects/${projectId}`, 200, durationMs, {
      projectTitle: project.title,
      deletedImageCount,
    }, req);

    res.json({ message: "Gallery project deleted" });
  } catch (error) {
    logger.logError("DELETE_GALLERY_PROJECT", error, { projectId });
    throw error;
  }
});

export {
  getGalleryProjects,
  getGalleryProjectById,
  createGalleryProject,
  updateGalleryProject,
  deleteGalleryProject,
};
