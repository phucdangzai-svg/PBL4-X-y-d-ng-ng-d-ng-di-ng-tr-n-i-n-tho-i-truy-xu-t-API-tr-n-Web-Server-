import pool from "../configs/db.config.js";

/**
 * Tìm tài khoản theo email, kèm tên vai trò để xác thực và phân quyền.
 */
export const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.password, u.full_name, u.email, u.phone,
            u.role_id, u.status,
            r.name AS role
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ?
     LIMIT 1`,
    [email],
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
    `SELECT u.id, u.email, u.full_name, u.phone, u.role_id, u.status,
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
  password,
  fullName,
  email,
  phone,
  roleId,
}) => {
  const [result] = await pool.query(
    `INSERT INTO users
      (password, full_name, email, phone, role_id, status)
     VALUES (?, ?, ?, ?, ?, 1)`,
    [password, fullName, email, phone || null, roleId],
  );

  return result.insertId;
};

export const createUserWithCustomer = async ({
  password,
  fullName,
  email,
  phone,
  roleId,
}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [userResult] = await connection.query(
      `INSERT INTO users
        (password, full_name, email, phone, role_id, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [password, fullName, email, phone || null, roleId],
    );
    const userId = userResult.insertId;

    await connection.query(
      `INSERT INTO customers
        (user_id, full_name, email, phone)
       VALUES (?, ?, ?, ?)`,
      [userId, fullName, email || null, phone || null],
    );

    await connection.commit();
    return userId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const ensureCustomerForUser = async (user) => {
  const [existing] = await pool.query(
    "SELECT id FROM customers WHERE user_id = ? LIMIT 1",
    [user.id],
  );
  if (existing.length > 0) return existing[0].id;

  try {
    const [result] = await pool.query(
      `INSERT INTO customers (user_id, full_name, email, phone)
       VALUES (?, ?, ?, ?)`,
      [user.id, user.full_name, user.email || null, user.phone || null],
    );
    return result.insertId;
  } catch (error) {
    if (error.code !== "ER_DUP_ENTRY" || !user.email) throw error;

    const [result] = await pool.query(
      `INSERT INTO customers (user_id, full_name, phone)
       VALUES (?, ?, ?)`,
      [user.id, user.full_name, user.phone || null],
    );
    return result.insertId;
  }
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
 * Email is the unique login identifier.
 */
