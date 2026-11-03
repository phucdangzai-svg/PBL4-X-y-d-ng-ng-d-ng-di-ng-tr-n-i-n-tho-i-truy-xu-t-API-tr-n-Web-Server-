import pool from "../configs/db.config.js";

// Tìm loại phòng được ánh xạ từ OTA
export const findOtaRoomMapping = async (
  channelId,
  roomCode,
  connection = pool,
) => {
  const [rows] = await connection.execute(
    `SELECT room_type_id
     FROM ota_room_mappings
     WHERE channel_id = ?
       AND ota_room_code = ?
       AND status = 'active'
     LIMIT 1`,
    [channelId, roomCode],
  );

  return rows[0] || null;
};

// Kiểm tra external_booking_id đã tồn tại chưa
export const findOtaBookingByExternalId = async (
  channelId,
  externalBookingId,
  connection = pool,
) => {
  const [rows] = await connection.execute(
    `SELECT id, booking_id, external_booking_id
     FROM ota_bookings
     WHERE channel_id = ?
       AND external_booking_id = ?
     LIMIT 1`,
    [channelId, externalBookingId],
  );

  return rows[0] || null;
};

// Lấy danh sách phòng thuộc loại phòng cần đặt
export const findRoomCandidatesByType = async (roomTypeId, connection) => {
  const [rows] = await connection.execute(
    `SELECT id
     FROM rooms
     WHERE room_type_id = ?
       AND status <> 'maintenance'
     ORDER BY id ASC`,
    [roomTypeId],
  );

  return rows;
};

// Tìm khách hàng theo email hoặc số điện thoại
export const findCustomerByEmailOrPhone = async (email, phone, connection) => {
  const conditions = [];
  const params = [];

  if (email) {
    conditions.push("email = ?");
    params.push(email);
  }

  if (phone) {
    conditions.push("phone = ?");
    params.push(phone);
  }

  if (conditions.length === 0) {
    return [];
  }

  const [rows] = await connection.execute(
    `SELECT id, user_id, full_name, email, phone
     FROM customers
     WHERE ${conditions.join(" OR ")}`,
    params,
  );

  return rows;
};

// Tạo hồ sơ khách hàng mới, không tạo tài khoản đăng nhập
export const createCustomer = async (customer, connection) => {
  const { full_name, email, phone } = customer;

  const [result] = await connection.execute(
    `INSERT INTO customers
      (user_id, full_name, email, phone)
     VALUES (NULL, ?, ?, ?)`,
    [full_name, email, phone],
  );

  return result.insertId;
};

// Lưu liên kết OTA Booking với PMS Booking
export const insertOtaBooking = async (data, connection) => {
  const { channel_id, booking_id, external_booking_id, raw_data } = data;

  const [result] = await connection.execute(
    `INSERT INTO ota_bookings
      (channel_id, booking_id, external_booking_id, raw_data)
     VALUES (?, ?, ?, ?)`,
    [channel_id, booking_id, external_booking_id, JSON.stringify(raw_data)],
  );

  return result.insertId;
};

// Ghi lịch sử đồng bộ
export const insertSyncLog = async (data, connection = pool) => {
  const { channel_id, event_type, status, external_booking_id, message } = data;

  const [result] = await connection.execute(
    `INSERT INTO sync_logs
      (channel_id, event_type, status, external_booking_id, message)
     VALUES (?, ?, ?, ?, ?)`,
    [
      channel_id,
      event_type,
      status,
      external_booking_id ?? null,
      message ?? null,
    ],
  );

  return result.insertId;
};
