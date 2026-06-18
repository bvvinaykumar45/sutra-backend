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

export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMemberSchema,
);
