import multer from "multer";

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

import { ApiError } from "../utils/api-error.js";

export const createUploadMiddleware = (options) => {
  const uploadPath = `./public/uploads/${options.folder}`;

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const randomBytes = crypto.randomBytes(3).toString("hex");
      const uniqueSuffix = "-" + Date.now() + "-" + randomBytes;
      const filename =
        options.filePrefix + uniqueSuffix + path.extname(file.originalname);

      cb(null, filename);
    },
  });

  const fileFilter = function (req, file, cb) {
    const allowedTypes = options.allowedTypes || [];
    const mimeType = allowedTypes.includes(file.mimetype);

    if (mimeType) {
      return cb(null, true);
    } else {
      return cb(
        new ApiError(400, options.errorMessage || "Unsupported File Type"),
        false,
      );
    }
  };

  const upload = multer({
    storage,
    limits: { fileSize: options.maxFileSize || 5 * 1024 * 1024 },
    fileFilter,
  });

  return upload;
};
