import pool from "../configs/db.config.js";

export const findAllBookings = async (connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT b.*,
            c.full_name AS customer_name,
            r.room_number,
            rt.name AS room_type_name,
            CASE
              WHEN ob.id IS NULL THEN 'DIRECT'
              ELSE oc.channel_code
            END AS booking_source,
            oc.name AS channel_name,
            ob.external_booking_id
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     LEFT JOIN ota_bookings ob ON ob.booking_id = b.id
     LEFT JOIN ota_channels oc ON oc.id = ob.channel_id
     ORDER BY b.id DESC`,
  );

  return rows;
};

export const findBookingById = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT b.*,
            c.full_name AS customer_name,
            c.user_id AS customer_user_id,
            r.room_number,
            rt.name AS room_type_name,
            CASE
              WHEN ob.id IS NULL THEN 'DIRECT'
              ELSE oc.channel_code
            END AS booking_source,
            oc.name AS channel_name,
            ob.external_booking_id
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     LEFT JOIN ota_bookings ob ON ob.booking_id = b.id
     LEFT JOIN ota_channels oc ON oc.id = ob.channel_id
     WHERE b.id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

export const findCustomerByUserId = async (userId, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT id, user_id, full_name
     FROM customers
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  return rows[0] || null;
};

export const findCustomerById = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT id, user_id, full_name
     FROM customers
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

export const findRoomForBooking = async (id, connection) => {
  const [rows] = await connection.execute(
    `SELECT id, room_number, room_type_id, price, status
     FROM rooms
     WHERE id = ?
     FOR UPDATE`,
    [id],
  );

  return rows[0] || null;
};

export const findOverlappingBooking = async (
  roomId,
  checkIn,
  checkOut,
  connection,
) => {
  const [rows] = await connection.execute(
    `SELECT id
     FROM bookings
     WHERE room_id = ?
       AND status <> 'cancelled'
       AND check_in < ?
       AND check_out > ?
     LIMIT 1
     FOR UPDATE`,
    [roomId, checkOut, checkIn],
  );

  return rows[0] || null;
};

export const insertBooking = async (booking, connection) => {
  const {
    customer_id,
    room_id,
    price_per_night,
    check_in,
    check_out,
    total_price,
    status,
    note,
  } = booking;

  const [result] = await connection.execute(
    `INSERT INTO bookings
      (customer_id, room_id, price_per_night,
       check_in, check_out, total_price, status, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customer_id,
      room_id,
      price_per_night,
      check_in,
      check_out,
      total_price,
      status,
      note ?? null,
    ],
  );

  return result.insertId;
};

export const updateBookingStatus = async (id, status, connection = pool) => {
  await connection.execute(
    `UPDATE bookings
     SET status = ?
     WHERE id = ?`,
    [status, id],
  );

  return findBookingById(id, connection);
};

export const findBookingsByCustomerUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT b.*,
            c.full_name AS customer_name,
            r.room_number,
            rt.name AS room_type_name,
            CASE
              WHEN ob.id IS NULL THEN 'DIRECT'
              ELSE oc.channel_code
            END AS booking_source,
            oc.name AS channel_name,
            ob.external_booking_id
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     JOIN rooms r ON r.id = b.room_id
     JOIN room_types rt ON rt.id = r.room_type_id
     LEFT JOIN ota_bookings ob ON ob.booking_id = b.id
     LEFT JOIN ota_channels oc ON oc.id = ob.channel_id
     WHERE c.user_id = ?
     ORDER BY b.id DESC`,
    [userId],
  );

  return rows;
};

export const updateRoomStatus = async (roomId, status, connection) => {
  await connection.execute(`UPDATE rooms SET status = ? WHERE id = ?`, [
    status,
    roomId,
  ]);
};

export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
