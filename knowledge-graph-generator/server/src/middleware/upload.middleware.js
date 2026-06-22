import multer from 'multer';
import path from 'path';
import fs from 'fs';
import CustomError from '../utils/customError.js';

// Ensure uploads directory exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow PDF files only
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new CustomError('Invalid file type. Only PDF uploads are supported.', 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit
  },
});

export default upload;
