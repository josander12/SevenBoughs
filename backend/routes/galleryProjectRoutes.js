import express from "express";
import {
  createGalleryProject,
  deleteGalleryProject,
  getGalleryProjectById,
  getGalleryProjects,
  updateGalleryProject,
} from "../controllers/galleryProjectController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import checkObjectId from "../middleware/checkObjectId.js";

const router = express.Router();

router
  .route("/")
  .get(getGalleryProjects)
  .post(protect, admin, createGalleryProject);
router
  .route("/:id")
  .get(checkObjectId, getGalleryProjectById)
  .put(protect, admin, checkObjectId, updateGalleryProject)
  .delete(protect, admin, checkObjectId, deleteGalleryProject);

export default router;
