import express from "express";
const router = express.Router();
import { sendContactEmail } from "../controllers/contactController.js";

// Route for handling contact form submission
router.route("/").post(sendContactEmail);

export default router;