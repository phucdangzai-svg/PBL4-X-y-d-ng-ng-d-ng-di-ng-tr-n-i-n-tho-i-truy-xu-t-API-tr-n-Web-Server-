import pool from "../configs/db.config.js";

/**
 * Lưu Refresh Token và thời điểm hết hạn vào MySQL.
 */
export const createRefreshToken = async (userId, token, expiresAt) => {
  const [result] = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, token, expiresAt],
  );

  return result.insertId;
};

/**
 * Tìm Refresh Token còn hạn và thuộc đúng tài khoản.
 */
export const findValidRefreshToken = async (userId, token) => {
  const [rows] = await pool.query(
    `SELECT id, user_id, token, expires_at
     FROM refresh_tokens
     WHERE user_id = ? AND token = ? AND expires_at > NOW()
     LIMIT 1`,
    [userId, token],
  );

  return rows[0] ?? null;
};

/**
 * Thu hồi một Refresh Token khi người dùng đăng xuất hoặc làm mới phiên.
 */
export const deleteRefreshToken = async (token) => {
  const [result] = await pool.query(
    "DELETE FROM refresh_tokens WHERE token = ?",
    [token],
  );

  return result.affectedRows;
};
