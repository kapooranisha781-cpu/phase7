import mongoose from "mongoose";
import Note from "../models/Note.js";
import Project from "../models/Project.js";

const getAccessibleProject = async (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return Project.findOne({
    _id: projectId,
    members: userId,
  });
};

export const createNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content = "" } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Note title is required.",
      });
    }

    if (typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Note content must be text.",
      });
    }

    const project = await getAccessibleProject(projectId, req.userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content,
      project: project._id,
      author: req.userId,
    });

    await note.populate("author", "name email");

    return res.status(201).json({
      success: true,
      message: "Note created successfully!",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create note.",
    });
  }
};

export const getProjectNotes = async (req, res) => {
  try {
    const project = await getAccessibleProject(
      req.params.projectId,
      req.userId
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const notes = await Note.find({ project: project._id })
      .populate("author", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error("Get notes error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch notes.",
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const { title, content } = req.body;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const project = await getAccessibleProject(projectId, req.userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const note = await Note.findOne({
      _id: noteId,
      project: project._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Note title cannot be empty.",
        });
      }
      note.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string") {
        return res.status(400).json({
          success: false,
          message: "Note content must be text.",
        });
      }
      note.content = content;
    }

    await note.save();
    await note.populate("author", "name email");

    return res.status(200).json({
      success: true,
      message: "Note updated successfully!",
      note,
    });
  } catch (error) {
    console.error("Update note error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update note.",
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;

    if (!mongoose.isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID.",
      });
    }

    const project = await getAccessibleProject(projectId, req.userId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: noteId,
      project: project._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully!",
    });
  } catch (error) {
    console.error("Delete note error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to delete note.",
    });
  }
};
