import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

// Thư mục lưu ảnh phòng
const uploadDir = path.join(process.cwd(), "uploads", "rooms");

// Tự động tạo thư mục nếu chưa tồn tại
fs.mkdirSync(uploadDir, { recursive: true });

// Cấu hình nơi lưu và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${randomUUID()}${extension}`);
  },
});

// Chỉ cho phép các định dạng ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP");
    error.status = 400;

    return cb(error);
  }

  cb(null, true);
};

// Cấu hình Multer
export const uploadRoomImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Tối đa 5 MB
  },
}).single("image");
