import pool from "../configs/db.config.js";

// Thống kê số lượng phòng và booking hôm nay
export const getDashboardSummary = async () => {
  const [rows] = await pool.execute(`
    SELECT
      (SELECT COUNT(*) FROM rooms) AS totalRooms,

      (SELECT COUNT(*) FROM rooms
       WHERE status = 'available') AS availableRooms,

      (SELECT COUNT(*) FROM rooms
       WHERE status = 'occupied') AS occupiedRooms,

      (SELECT COUNT(*) FROM rooms
       WHERE status = 'maintenance') AS maintenanceRooms,

      (SELECT COUNT(*) FROM bookings
       WHERE status <> 'cancelled'
         AND created_at >= CURDATE()
         AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      ) AS todayBookings
  `);

  return rows[0];
};

// Thống kê trạng thái phòng
export const getRoomOccupancy = async () => {
  const [rows] = await pool.execute(`
    SELECT status, COUNT(*) AS total
    FROM rooms
    GROUP BY status
  `);

  return rows;
};

// Thống kê booking theo ngày, không tính booking đã hủy

export const getBookingTrend = async (days) => {
  const [rows] = await pool.execute(
    `
      SELECT
        DATE(created_at) AS date,
        COUNT(*) AS total
      FROM bookings
      WHERE status <> 'cancelled'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `,
    [days - 1],
  );

  return rows;
};

// Thống kê booking theo trạng thái
export const getBookingStatus = async (days) => {
  const [rows] = await pool.execute(
    `
      SELECT status, COUNT(*) AS total
      FROM bookings
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
      GROUP BY status
    `,
    [days - 1],
  );

  return rows;
};

// Lấy 5 booking mới nhất
export const getRecentBookings = async () => {
  const [rows] = await pool.execute(`
    SELECT
      b.id,
      b.status,
      b.check_in,
      b.check_out,
      b.total_price,
      b.created_at,
      c.full_name AS customer_name,
      r.room_number,
      rt.name AS room_type_name
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    JOIN rooms r ON r.id = b.room_id
    LEFT JOIN room_types rt ON rt.id = r.room_type_id
    ORDER BY b.created_at DESC
    LIMIT 5
  `);

  return rows;
};
