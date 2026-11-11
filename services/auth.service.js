import bcrypt from "bcrypt";
import * as authRepository from "../repositories/auth.repository.js";
import * as tokenRepository from "../repositories/token.repository.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

/**
 * Tạo lỗi nghiệp vụ có mã HTTP và thông tin validation.
 */
const createError = (message, status = 400, details) => {
  const error = new Error(message);
  error.status = status;

  if (details) {
    error.details = details;
  }

  return error;
};

/**
 * Kiểm tra email và password theo quy tắc đăng ký.
 */
const validateCredentials = ({ email, password }) => {
  const errors = [];

  if (typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("Invalid email");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must contain at least 8 characters");
  } else if (password.length > 72) {
    errors.push("Password must not exceed 72 bytes for bcrypt");
  }

  if (errors.length > 0) {
    throw createError("Validation failed", 400, errors);
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};

/**
 * Đăng ký tài khoản Guest với mật khẩu đã được hash bằng bcrypt.
 */

/**
 * Đăng ký tài khoản Guest sau khi xác thực dữ liệu và hash mật khẩu.
 */
export const registerService = async (data = {}) => {
  const errors = [];

  const { password, full_name, email, phone } = data;

  if (typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  } else if (
    email.trim().length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push("Invalid email");
  }

  if (typeof password !== "string" || password.length < 8) {
    errors.push("Password must contain at least 8 characters");
  } else if (Buffer.byteLength(password, "utf8") > 72) {
    errors.push("Password must not exceed 72 bytes for bcrypt");
  }

  if (typeof full_name !== "string" || !full_name.trim()) {
    errors.push("Full name is required");
  } else if (full_name.trim().length > 100) {
    errors.push("Full name must not exceed 100 characters");
  }

  if (phone !== undefined && phone !== null && phone !== "") {
    if (typeof phone !== "string" || !/^[0-9]{10}$/.test(phone)) {
      errors.push("Phone number must contain exactly 10 digits");
    }
  }

  if (errors.length > 0) {
    throw createError("Validation failed", 400, errors);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail &&
    (await authRepository.isEmailExists(normalizedEmail))
  ) {
    throw createError("Email already exists", 409);
  }

  const guestRole = await authRepository.findRoleByName("guest");

  if (!guestRole) {
    throw createError("Guest role is not configured", 500);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userId = await authRepository.createUserWithCustomer({
      password: hashedPassword,
      fullName: full_name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      roleId: guestRole.id,
    });

    return {
      id: userId,
      email: normalizedEmail,
      full_name: full_name.trim(),
      role: guestRole.name,
    };
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      throw createError("Email already exists", 409);
    }

    throw err;
  }
};

/**
 * Đăng nhập, kiểm tra mật khẩu và cấp Access Token cùng Refresh Token.
 */
export const loginService = async (data = {}) => {
  const errors = [];

  if (typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required");
  }

  if (typeof data.password !== "string" || !data.password) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    throw createError("Validation failed", 400, errors);
  }

  const user = await authRepository.findUserByEmail(data.email.trim().toLowerCase());

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    throw createError("Invalid email or password", 401);
  }

  if (user.status !== 1) {
    throw createError("Account is disabled", 403);
  }

  if (user.role === "guest") {
    await authRepository.ensureCustomerForUser(user);
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  const decoded = verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000);

  await tokenRepository.createRefreshToken(user.id, refreshToken, expiresAt);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Làm mới Access Token bằng Refresh Token còn hợp lệ trong database.
 */
export const refreshTokenService = async (data = {}) => {
  if (typeof data.refreshToken !== "string" || !data.refreshToken) {
    throw createError("Refresh Token is required", 400);
  }

  let payload;

  try {
    payload = verifyRefreshToken(data.refreshToken);
  } catch {
    throw createError("Invalid or expired Refresh Token", 401);
  }

  const storedToken = await tokenRepository.findValidRefreshToken(
    payload.id,
    data.refreshToken,
  );

  if (!storedToken) {
    throw createError("Refresh Token has been revoked or expired", 401);
  }

  const user = await authRepository.findUserById(payload.id);

  if (!user || user.status !== 1) {
    throw createError("Account is unavailable", 401);
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { accessToken };
};

/**
 * Đăng xuất bằng cách xóa Refresh Token khỏi database.
 */
export const logoutService = async (data = {}) => {
  if (typeof data.refreshToken !== "string" || !data.refreshToken) {
    throw createError("Refresh Token is required", 400);
  }

  await tokenRepository.deleteRefreshToken(data.refreshToken);

  return true;
};
