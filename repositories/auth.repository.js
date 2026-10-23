import pool from "../configs/db.config.js";

/**
 * Tìm tài khoản theo username, kèm tên vai trò để xác thực và phân quyền.
 */
export const findUserByUsername = async (username) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.password, u.role_id, u.status,
            r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.username = ?
     LIMIT 1`,
    [username],
  );

  return rows[0] ?? null;
};

/**
 * Kiểm tra email đã được sử dụng hay chưa.
 */
export const isEmailExists = async (email) => {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email],
  );

  return rows.length > 0;
};

/**
 * Tìm tài khoản theo ID, kèm tên vai trò.
 */
export const findUserById = async (id) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.role_id, u.status,
            r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
};

/**
 * Tạo tài khoản mới với mật khẩu đã được hash.
 */
/**
 * Tạo tài khoản mới với mật khẩu đã hash và thông tin cá nhân.
 */

/**
 * Tạo tài khoản mới với mật khẩu đã hash và thông tin cá nhân.
 */
export const createUser = async ({
  username,
  password,
  fullName,
  email,
  phone,
  roleId,
}) => {
  const [result] = await pool.query(
    `INSERT INTO users
      (username, password, full_name, email, phone, role_id, status)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [username, password, fullName, email || null, phone || null, roleId],
  );

  return result.insertId;
};

/**
 * Lấy ID của vai trò theo tên.
 */
export const findRoleByName = async (roleName) => {
  const [rows] = await pool.query(
    "SELECT id, name FROM roles WHERE name = ? LIMIT 1",
    [roleName],
  );

  return rows[0] ?? null;
};

/**
 * Kiểm tra username đã được sử dụng hay chưa.
 */
export const isUsernameExists = async (username) => {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE username = ? LIMIT 1",
    [username],
  );

  return rows.length > 0;
};
