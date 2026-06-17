import mongoose, { mongo, Schema } from "mongoose";

const projectNoteSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProjectNote = mongoose.model("ProjectNote", projectNoteSchema);
