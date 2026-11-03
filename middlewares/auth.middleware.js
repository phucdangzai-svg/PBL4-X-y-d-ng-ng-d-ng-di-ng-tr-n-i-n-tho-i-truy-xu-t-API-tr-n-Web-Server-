import { verifyAccessToken } from "../utils/jwt.js";

/**
 * Xác thực Access Token trong Authorization header.
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const error = new Error("Access Token is required");
      error.status = 401;
      throw error;
    }

    const parts = authHeader.trim().split(/\s+/);

    if (
      parts.length !== 2 ||
      parts[0].toLowerCase() !== "bearer" ||
      !parts[1]
    ) {
      const error = new Error("Invalid Authorization header");
      error.status = 401;
      throw error;
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      err.status = 401;
      err.message = "Access Token đã hết hạn";
    } else if (err.name === "JsonWebTokenError") {
      err.status = 401;
      err.message = "Access Token không hợp lệ";
    }

    next(err);
  }
};

/**
 * Chỉ cho phép những vai trò được chỉ định truy cập API.
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error("Authentication is required");
      error.status = 401;
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error("Bạn không có quyền truy cập");
      error.status = 403;
      return next(error);
    }

    next();
  };
};

/**
 * Chỉ cho phép Admin truy cập API.
 */
export const authorizeAdmin = authorize("admin");

/**
 * Chỉ cho phép Owner truy cập API.
 */
export const authorizeOwner = authorize("owner");

/**
 * Chỉ cho phép Guest truy cập API.
 */
export const authorizeGuest = authorize("guest");
