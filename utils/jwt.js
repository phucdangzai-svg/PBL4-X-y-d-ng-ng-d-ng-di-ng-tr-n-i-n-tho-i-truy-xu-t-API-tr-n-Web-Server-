import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets must be configured in .env");
}

/**
 * Tạo Access Token thời hạn ngắn để gọi API được bảo vệ.
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "10m" },
  );
};

/**
 * Tạo Refresh Token để xin Access Token mới.
 */
export const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

/**
 * Xác minh chữ ký và thời hạn của Access Token.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

/**
 * Xác minh chữ ký và thời hạn của Refresh Token.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};
