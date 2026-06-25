import multer from "multer";

import crypto from "node:crypto";
import path from "node:path";

import { ApiError } from "../utils/api-error.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/tasks");
  },
  filename: function (req, file, cb) {
    const randomBytes = crypto.randomBytes(3).toString("hex");
    const uniqueSuffix = "-" + Date.now() + "-" + randomBytes;
    const filename =
      "task-attachment" + uniqueSuffix + path.extname(file.originalname);

    cb(null, filename);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/png, image/jpeg, application/pdf"];
  const isMimeTypeAllowed = allowedTypes.includes(file.mimetype);

  if (isMimeTypeAllowed) {
    return cb(null, true);
  } else {
    return cb(
      new ApiError(400, "Only PNG, JPEG, and PDF files are allowed"),
      false,
    );
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
