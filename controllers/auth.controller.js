import * as authService from "../services/auth.service.js";

/**
 * Xử lý request đăng ký tài khoản.
 */
export const register = async (req, res, next) => {
  try {
    const data = await authService.registerService(req.body);

    res.status(201).json({
      success: true,
      message: "Register successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý request đăng nhập.
 */
export const login = async (req, res, next) => {
  try {
    const data = await authService.loginService(req.body);

    res.status(200).json({
      success: true,
      message: "Login successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cấp Access Token mới từ Refresh Token.
 */
export const refresh = async (req, res, next) => {
  try {
    const data = await authService.refreshTokenService(req.body);

    res.status(200).json({
      success: true,
      message: "Refresh token successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý đăng xuất và thu hồi Refresh Token.
 */
export const logout = async (req, res, next) => {
  try {
    await authService.logoutService(req.body);

    res.status(200).json({
      success: true,
      message: "Logout successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trả thông tin người dùng từ Access Token đã xác thực.
 */
export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Get current user successfully",
    data: req.user,
  });
};
