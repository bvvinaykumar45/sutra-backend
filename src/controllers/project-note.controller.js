import { ProjectNote } from "../models/project-note.model.js";
import { Project } from "../models/project.model.js";

import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const createProjectNote = asyncHandler(async (req, res) => {
  const user = req.user;
  const { projectId } = req.params;
  const { title, content } = req.body;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists.");

  const note = await ProjectNote.create({
    title,
    content,
    projectId,
    createdBy: user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Project Note is created successfully."));
});

const getProjectNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists");

  const notes = await ProjectNote.find({
    projectId,
  })
    .populate("createdBy", "_id userName email avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, notes, "Project Notes are fetched successfully."),
    );
});

const getProjectNoteById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const project = await Project.findById(projectId).select("_id");
  if (!project) throw new ApiError(404, "Project does not exists.");

  const note = await ProjectNote.findOne({
    _id: noteId,
    projectId,
  }).populate("createdBy", "_id userName email avatar");

  if (!note) throw new ApiError(404, "Project Note does not exists");

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Project Note fetched successfully."));
});

export { createProjectNote, getProjectNoteById, getProjectNotes };
