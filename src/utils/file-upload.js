import { createUploadMiddleware } from "../middlewares/multer.middleware.js";

export const taskAttachmentUpload = createUploadMiddleware({
  folder: "tasks",
  filePrefix: "task-attachment",
  allowedTypes: ["image/png", "image/jpeg", "application/pdf"],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  errorMessage: "Only PNG, JPEG, and PDF files are allowed",
});
