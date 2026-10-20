
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createNote,
  getProjectNotes,
  updateNote,
  deleteNote,
} from "../controllers/noteController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/:projectId", getProjectNotes);
router.post("/:projectId", createNote);
router.put("/:projectId/:noteId", updateNote);
router.delete("/:projectId/:noteId", deleteNote);

export default router;
