import pool from "../configs/db.config.js";

// Lấy danh sách tất cả loại phòng.

export const getAllRoomTypes = async () => {
  const [rows] = await pool.query(
    `SELECT id, name, description, capacity, created_at, updated_at
     FROM room_types
     ORDER BY id ASC`,
  );

  return rows;
};

// Lấy thông tin một loại phòng theo ID.

export const getRoomTypeById = async (id) => {
  const [rows] = await pool.query(
    `SELECT id, name, description, capacity, created_at, updated_at
     FROM room_types
     WHERE id = ?`,
    [id],
  );

  return rows[0] ?? null;
};

// Kiểm tra tên loại phòng đã được sử dụng chưa.

export const isRoomTypeNameExists = async (name, excludeId = null) => {
  let sql = "SELECT id FROM room_types WHERE name = ?";
  const params = [name];

  if (excludeId !== null) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  sql += " LIMIT 1";

  const [rows] = await pool.query(sql, params);

  return rows.length > 0;
};

// Kiểm tra loại phòng có phòng nào đang tham chiếu hay không.

export const isRoomTypeInUse = async (id) => {
  const [rows] = await pool.query(
    "SELECT id FROM rooms WHERE room_type_id = ? LIMIT 1",
    [id],
  );

  return rows.length > 0;
};

//  Thêm một loại phòng mới và trả về ID vừa tạo.

export const createRoomType = async (roomType) => {
  const [result] = await pool.query(
    `INSERT INTO room_types (name, description, capacity)
     VALUES (?, ?, ?)`,
    [roomType.name, roomType.description, roomType.capacity],
  );

  return result.insertId;
};

//  Cập nhật thông tin loại phòng theo ID.

export const updateRoomType = async (id, roomType) => {
  const [result] = await pool.query(
    `UPDATE room_types
     SET name = ?, description = ?, capacity = ?
     WHERE id = ?`,
    [roomType.name, roomType.description, roomType.capacity, id],
  );

  return result.affectedRows;
};

/**
 * Xóa loại phòng theo ID.
 * Khóa ngoại trong database vẫn bảo vệ dữ liệu nếu loại phòng đang được sử dụng.
 */
export const deleteRoomType = async (id) => {
  const [result] = await pool.query("DELETE FROM room_types WHERE id = ?", [
    id,
  ]);

  return result.affectedRows;
};
