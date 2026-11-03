import pool from "../configs/db.config.js";

// ==================== OTA CHANNELS ====================

export const findAllChannels = async () => {
  const [rows] = await pool.execute(
    `SELECT
        id,
        channel_code,
        name,
        status,
        CASE
          WHEN api_key_hash IS NULL THEN 0
          ELSE 1
        END AS has_api_key,
        created_at,
        updated_at
     FROM ota_channels
     ORDER BY id ASC`,
  );

  return rows;
};

export const findChannelById = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT id, channel_code, name, status
     FROM ota_channels
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

export const updateChannelStatus = async (id, status) => {
  await pool.execute(
    `UPDATE ota_channels
     SET status = ?
     WHERE id = ?`,
    [status, id],
  );

  return findChannelById(id);
};

// ==================== ROOM MAPPINGS ====================

export const findAllMappings = async (filters = {}) => {
  const conditions = [];
  const params = [];

  if (filters.channel_id) {
    conditions.push("orm.channel_id = ?");
    params.push(filters.channel_id);
  }

  if (filters.room_type_id) {
    conditions.push("orm.room_type_id = ?");
    params.push(filters.room_type_id);
  }

  if (filters.status) {
    conditions.push("orm.status = ?");
    params.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await pool.execute(
    `SELECT
        orm.id,
        orm.channel_id,
        oc.channel_code,
        oc.name AS channel_name,
        orm.room_type_id,
        rt.name AS room_type_name,
        orm.ota_room_code,
        orm.ota_room_name,
        orm.status
     FROM ota_room_mappings orm
     JOIN ota_channels oc ON oc.id = orm.channel_id
     JOIN room_types rt ON rt.id = orm.room_type_id
     ${where}
     ORDER BY orm.id DESC`,
    params,
  );

  return rows;
};

export const findMappingById = async (id, connection = pool) => {
  const [rows] = await connection.execute(
    `SELECT *
     FROM ota_room_mappings
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

export const findMappingByChannelAndRoomType = async (
  channelId,
  roomTypeId,
  excludeId = null,
  connection = pool,
) => {
  const [rows] = await connection.execute(
    `SELECT id
     FROM ota_room_mappings
     WHERE channel_id = ?
       AND room_type_id = ?
       AND (? IS NULL OR id <> ?)
     LIMIT 1`,
    [channelId, roomTypeId, excludeId, excludeId],
  );

  return rows[0] || null;
};

export const insertMapping = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO ota_room_mappings
      (channel_id, room_type_id, ota_room_code, ota_room_name, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.channel_id,
      data.room_type_id,
      data.ota_room_code,
      data.ota_room_name,
      data.status,
    ],
  );

  return findMappingById(result.insertId);
};

export const updateMapping = async (id, data) => {
  await pool.execute(
    `UPDATE ota_room_mappings
     SET channel_id = ?,
         room_type_id = ?,
         ota_room_code = ?,
         ota_room_name = ?,
         status = ?
     WHERE id = ?`,
    [
      data.channel_id,
      data.room_type_id,
      data.ota_room_code,
      data.ota_room_name,
      data.status,
      id,
    ],
  );

  return findMappingById(id);
};

export const deleteMapping = async (id) => {
  await pool.execute(`DELETE FROM ota_room_mappings WHERE id = ?`, [id]);
};

// ==================== SYNC LOGS ====================

export const findAllSyncLogs = async (filters) => {
  const conditions = [];
  const params = [];

  if (filters.channel_id) {
    conditions.push("sl.channel_id = ?");
    params.push(filters.channel_id);
  }

  if (filters.status) {
    conditions.push("sl.status = ?");
    params.push(filters.status);
  }

  if (filters.event_type) {
    conditions.push("sl.event_type = ?");
    params.push(filters.event_type);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM sync_logs sl
     ${where}`,
    params,
  );

  const total = Number(countRows[0].total);

  const offset = (filters.page - 1) * filters.limit;

  const [rows] = await pool.execute(
    `SELECT
        sl.id,
        sl.channel_id,
        oc.channel_code,
        oc.name AS channel_name,
        sl.event_type,
        sl.status,
        sl.external_booking_id,
        sl.message,
        sl.created_at
     FROM sync_logs sl
     JOIN ota_channels oc ON oc.id = sl.channel_id
     ${where}
     ORDER BY sl.id DESC
     LIMIT ? OFFSET ?`,
    [...params, filters.limit, offset],
  );

  return {
    page: filters.page,
    limit: filters.limit,
    total,
    totalPages: Math.ceil(total / filters.limit),
    data: rows,
  };
};
