import * as channelRepo from "../repositories/channelManager.repository.js";

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseId = (value, fieldName = "id") => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError(`${fieldName} must be a positive integer`);
  }

  return id;
};

const isDuplicateError = (error) => error.code === "ER_DUP_ENTRY";

const handleDatabaseError = (error) => {
  if (isDuplicateError(error)) {
    throw createError(
      "Mapping already exists or OTA Room Code is duplicated",
      409,
    );
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    throw createError("Channel or Room Type does not exist", 404);
  }

  throw error;
};

// ==================== OTA CHANNELS ====================

export const getChannelsService = async () => {
  return channelRepo.findAllChannels();
};

export const updateChannelStatusService = async (id, status) => {
  const channelId = parseId(id);

  if (!["active", "inactive"].includes(status)) {
    throw createError("Status must be active or inactive");
  }

  const channel = await channelRepo.findChannelById(channelId);

  if (!channel) {
    throw createError("OTA Channel not found", 404);
  }

  return channelRepo.updateChannelStatus(channelId, status);
};

// ==================== ROOM MAPPINGS ====================

const validateMappingData = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createError("Request body must be an object");
  }

  const channel_id = parseId(data.channel_id, "channel_id");
  const room_type_id = parseId(data.room_type_id, "room_type_id");

  if (typeof data.ota_room_code !== "string" || !data.ota_room_code.trim()) {
    throw createError("ota_room_code is required");
  }

  const ota_room_code = data.ota_room_code.trim();

  if (ota_room_code.length > 100) {
    throw createError("ota_room_code must not exceed 100 characters");
  }

  let ota_room_name = null;

  if (data.ota_room_name !== undefined && data.ota_room_name !== null) {
    if (typeof data.ota_room_name !== "string") {
      throw createError("ota_room_name must be a string");
    }

    ota_room_name = data.ota_room_name.trim() || null;

    if (ota_room_name && ota_room_name.length > 255) {
      throw createError("ota_room_name must not exceed 255 characters");
    }
  }

  const status = data.status ?? "active";

  if (!["active", "inactive"].includes(status)) {
    throw createError("Status must be active or inactive");
  }

  return {
    channel_id,
    room_type_id,
    ota_room_code,
    ota_room_name,
    status,
  };
};

export const getMappingsService = async (query) => {
  const filters = {};

  if (query.channel_id !== undefined) {
    filters.channel_id = parseId(query.channel_id, "channel_id");
  }

  if (query.room_type_id !== undefined) {
    filters.room_type_id = parseId(query.room_type_id, "room_type_id");
  }

  if (query.status !== undefined) {
    if (!["active", "inactive"].includes(query.status)) {
      throw createError("Status must be active or inactive");
    }

    filters.status = query.status;
  }

  return channelRepo.findAllMappings(filters);
};

export const createMappingService = async (data) => {
  const mapping = validateMappingData(data);

  const channel = await channelRepo.findChannelById(mapping.channel_id);

  if (!channel) {
    throw createError("OTA Channel not found", 404);
  }

  if (channel.status !== "active") {
    throw createError("Cannot create mapping for inactive channel", 400);
  }

  try {
    const duplicated = await channelRepo.findMappingByChannelAndRoomType(
      mapping.channel_id,
      mapping.room_type_id,
    );

    if (duplicated) {
      throw createError(
        "Mapping already exists for this channel and room type",
        409,
      );
    }

    return await channelRepo.insertMapping(mapping);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const updateMappingService = async (id, data) => {
  const mappingId = parseId(id);

  const existing = await channelRepo.findMappingById(mappingId);

  if (!existing) {
    throw createError("Room Mapping not found", 404);
  }

  const mapping = validateMappingData(data);

  const channel = await channelRepo.findChannelById(mapping.channel_id);

  if (!channel) {
    throw createError("OTA Channel not found", 404);
  }

  try {
    const duplicated = await channelRepo.findMappingByChannelAndRoomType(
      mapping.channel_id,
      mapping.room_type_id,
      mappingId,
    );

    if (duplicated) {
      throw createError(
        "Mapping already exists for this channel and room type",
        409,
      );
    }

    return await channelRepo.updateMapping(mappingId, mapping);
  } catch (error) {
    handleDatabaseError(error);
  }
};

export const deleteMappingService = async (id) => {
  const mappingId = parseId(id);

  const existing = await channelRepo.findMappingById(mappingId);

  if (!existing) {
    throw createError("Room Mapping not found", 404);
  }

  try {
    await channelRepo.deleteMapping(mappingId);

    return {
      id: mappingId,
      message: "Room Mapping deleted successfully",
    };
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw createError(
        "Cannot delete mapping because it is referenced by another record",
        409,
      );
    }

    throw error;
  }
};

// ==================== SYNC LOGS ====================

export const getSyncLogsService = async (query) => {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);

  if (!Number.isInteger(page) || page < 1) {
    throw createError("page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw createError("limit must be between 1 and 100");
  }

  const filters = {
    page,
    limit,
  };

  if (query.channel_id !== undefined) {
    filters.channel_id = parseId(query.channel_id, "channel_id");
  }

  if (query.status !== undefined) {
    if (!["success", "failed"].includes(query.status)) {
      throw createError("Status must be success or failed");
    }

    filters.status = query.status;
  }

  if (query.event_type !== undefined) {
    if (typeof query.event_type !== "string" || !query.event_type.trim()) {
      throw createError("event_type must be a non-empty string");
    }

    filters.event_type = query.event_type.trim();
  }

  return channelRepo.findAllSyncLogs(filters);
};
