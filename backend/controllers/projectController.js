import mongoose from "mongoose";
import Project from "../models/Project.js";
import User from "../models/User.js";

// CREATE PROJECT
export const createProject = async (req, res) => {
  try {
    const { name, description = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project name is required.",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      owner: req.userId,
      members: [req.userId],
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    return res.status(201).json({
      success: true,
      message: "Project created successfully!",
      project: populatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create project.",
    });
  }
};

// GET ALL PROJECTS OF LOGGED-IN USER
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.userId,
    })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch projects.",
    });
  }
};

// ADD A REGISTERED USER TO A PROJECT
export const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member email is required.",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // Only the project owner can add members.
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the project owner can add members.",
      });
    }

    const member = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No registered user found with this email.",
      });
    }

    const alreadyMember = project.members.some(
      (id) => id.toString() === member._id.toString()
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        message: "This user is already a project member.",
      });
    }

    project.members.push(member._id);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email")
      .populate("members", "name email");

    return res.status(200).json({
      success: true,
      message: "Project member added successfully!",
      project: updatedProject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to add project member.",
    });
  }
};