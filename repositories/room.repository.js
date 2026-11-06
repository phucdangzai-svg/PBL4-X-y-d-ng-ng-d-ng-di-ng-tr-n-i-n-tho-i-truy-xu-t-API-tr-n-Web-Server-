import pool from "../configs/db.config.js";

// dem so phong
export const countRooms = async (filters = {}) => {
  const { status, room_type_id } = filters;

  let sql = `
    SELECT COUNT(*) AS total
    FROM rooms r
    WHERE 1 = 1
  `;

  const params = [];

  if (status) {
    sql += " AND r.status = ?";
    params.push(status);
  }

  if (room_type_id !== undefined) {
    sql += " AND r.room_type_id = ?";
    params.push(room_type_id);
  }

  const [rows] = await pool.query(sql, params);

  return rows[0].total;
};

// lay tat ca danh sach phong
export const getAllRooms = async (filters = {}) => {
  const { status, room_type_id, limit, offset } = filters;

  let sql = `
        SELECT
            r.id,
            r.room_number,
            r.room_type_id,
            rt.name AS room_type_name,
            r.price,
            r.status,
            r.description,
            r.image_url,
            r.image_public_id
        FROM rooms r
        LEFT JOIN room_types rt ON r.room_type_id = rt.id
        WHERE 1 = 1
    `;

  const params = [];

  if (status) {
    sql += " AND r.status = ?";
    params.push(status);
  }

  if (room_type_id !== undefined) {
    sql += " AND r.room_type_id = ?";
    params.push(room_type_id);
  }

  sql += " ORDER BY r.id ASC";

  if (limit !== undefined && offset !== undefined) {
    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);
  }

  const [rows] = await pool.query(sql, params);

  return rows;
};

// lay danh sach phong theo id
export const getRoomById = async (id) => {
  const sql = `
        SELECT
            r.id,
            r.room_number,
            r.room_type_id,
            rt.name AS room_type_name,
            r.price,
            r.status,
            r.description,
            r.image_url,
            r.image_public_id
        FROM rooms r
        LEFT JOIN room_types rt
            ON r.room_type_id = rt.id
        WHERE r.id = ?
    `;

  const [rows] = await pool.query(sql, [id]);

  return rows[0] || null;
};
// tao them phong

// Tao phong
export const createRoom = async (room) => {
  const {
    room_number,
    room_type_id,
    price,
    status,
    description,
    image_url,
    image_public_id,
  } = room;

  const sql = `
    INSERT INTO rooms (
      room_number,
      room_type_id,
      price,
      status,
      description,
      image_url,
      image_public_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    room_number,
    room_type_id,
    price,
    status,
    description ?? null,
    image_url ?? null,
    image_public_id ?? null,
  ]);

  return result.insertId;
};
// cap nhat phong
// Cap nhat phong
export const updateRoom = async (id, room) => {
  const {
    room_number,
    room_type_id,
    price,
    status,
    description,
    image_url,
    image_public_id,
  } = room;

  const sql = `
    UPDATE rooms
    SET room_number = ?,
        room_type_id = ?,
        price = ?,
        status = ?,
        description = ?,
        image_url = ?,
        image_public_id = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [
    room_number,
    room_type_id,
    price,
    status,
    description,
    image_url,
    image_public_id,
    id,
  ]);

  return result.affectedRows;
};

// Xoa phong
export const deleteRoom = async (id) => {
  const sql = `
        DELETE FROM rooms
        WHERE id = ?
    `;

  const [result] = await pool.query(sql, [id]);

  return result.affectedRows;
};
export const updateRoomImage = async (id, image) => {
  const sql = `
    UPDATE rooms
    SET image_url = ?,
        image_public_id = ?
    WHERE id = ?
  `;

  const [result] = await pool.query(sql, [
    image.image_url,
    image.image_public_id,
    id,
  ]);

  return result.affectedRows;
};
