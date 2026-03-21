import mongoose from "mongoose";

const galleryProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);
// Index for the default sort order used in getGalleryProjects
galleryProjectSchema.index({ featured: -1, sortOrder: 1, createdAt: -1 });
const GalleryProject = mongoose.model("GalleryProject", galleryProjectSchema);

export default GalleryProject;
