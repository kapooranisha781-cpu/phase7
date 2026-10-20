import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createProject,
  getMyProjects,
  addProjectMember,
} from "../controllers/projectController.js";

const router = express.Router();

// All project routes require a valid JWT.
router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getMyProjects);
router.post("/:projectId/members", addProjectMember);

export default router;