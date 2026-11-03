export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Ảnh không được vượt quá 5 MB";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { errors: err.details }),
  });
};
