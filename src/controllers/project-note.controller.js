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

export { createProjectNote };
