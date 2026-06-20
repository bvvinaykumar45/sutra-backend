import mongoose, { Schema } from "mongoose";
import {
  AvailableProjectMemberRoles,
  ProjectMemberRoleEnum,
} from "../utils/constants.js";

const projectMemberSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: AvailableProjectMemberRoles,
      default: ProjectMemberRoleEnum.MEMBER,
    },
  },
  {
    timestamps: true,
  },
);

projectMemberSchema.index(
  {
    projectId: 1,
    userId: 1,
  },
  {
    name: "project_id_user_id_unique_index",
    unique: true,
  },
);

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
