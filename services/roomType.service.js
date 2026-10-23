import * as roomTypeRepository from "../repositories/roomType.repository.js";

/**
 * Kiểm tra dữ liệu loại phòng trước khi tạo hoặc cập nhật.
 */
const validateRoomTypeData = (roomType) => {
  const errors = [];

  if (typeof roomType.name !== "string" || !roomType.name.trim()) {
    errors.push("Room type name is required");
  }

  if (
    roomType.name !== undefined &&
    typeof roomType.name === "string" &&
    roomType.name.trim().length > 100
  ) {
    errors.push("Room type name must not exceed 100 characters");
  }

  if (
    roomType.description !== undefined &&
    roomType.description !== null &&
    typeof roomType.description !== "string"
  ) {
    errors.push("Description must be a string");
  }

  if (
    typeof roomType.capacity !== "number" ||
    !Number.isInteger(roomType.capacity) ||
    roomType.capacity <= 0
  ) {
    errors.push("Capacity must be a positive integer");
  }

  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  return {
    name: roomType.name.trim(),
    description: roomType.description?.trim() || null,
    capacity: roomType.capacity,
  };
};

/**
 * Kiểm tra ID loại phòng phải là số nguyên dương.
 */
const validateRoomTypeId = (id) => {
  const roomTypeId = Number(id);

  if (
    id === undefined ||
    id === null ||
    String(id).trim() === "" ||
    !Number.isInteger(roomTypeId) ||
    roomTypeId <= 0
  ) {
    const error = new Error("Invalid room type ID");
    error.status = 400;
    throw error;
  }

  return roomTypeId;
};

/**
 * Lấy danh sách tất cả loại phòng.
 */
export const getAllRoomTypesService = async () => {
  return await roomTypeRepository.getAllRoomTypes();
};

/**
 * Lấy thông tin loại phòng theo ID.
 */
export const getRoomTypeByIdService = async (id) => {
  const roomTypeId = validateRoomTypeId(id);
  const roomType = await roomTypeRepository.getRoomTypeById(roomTypeId);

  if (!roomType) {
    const error = new Error("Room type not found");
    error.status = 404;
    throw error;
  }

  return roomType;
};

/**
 * Tạo loại phòng mới sau khi kiểm tra dữ liệu và tên trùng.
 */
export const createRoomTypeService = async (data) => {
  const roomType = validateRoomTypeData(data);

  const nameExists = await roomTypeRepository.isRoomTypeNameExists(
    roomType.name,
  );

  if (nameExists) {
    const error = new Error("Room type name already exists");
    error.status = 409;
    throw error;
  }

  try {
    const id = await roomTypeRepository.createRoomType(roomType);

    return await roomTypeRepository.getRoomTypeById(id);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error("Room type name already exists");
      error.status = 409;
      throw error;
    }

    throw err;
  }
};

/**
 * Cập nhật loại phòng sau khi kiểm tra ID, dữ liệu và tên trùng.
 */
export const updateRoomTypeService = async (id, data) => {
  const roomTypeId = validateRoomTypeId(id);

  const existingRoomType = await roomTypeRepository.getRoomTypeById(roomTypeId);

  if (!existingRoomType) {
    const error = new Error("Room type not found");
    error.status = 404;
    throw error;
  }

  const roomType = validateRoomTypeData(data);

  const nameExists = await roomTypeRepository.isRoomTypeNameExists(
    roomType.name,
    roomTypeId,
  );

  if (nameExists) {
    const error = new Error("Room type name already exists");
    error.status = 409;
    throw error;
  }

  try {
    await roomTypeRepository.updateRoomType(roomTypeId, roomType);

    return await roomTypeRepository.getRoomTypeById(roomTypeId);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const error = new Error("Room type name already exists");
      error.status = 409;
      throw error;
    }

    throw err;
  }
};

/**
 * Xóa loại phòng nếu tồn tại và không có phòng nào tham chiếu đến nó.
 */
export const deleteRoomTypeService = async (id) => {
  const roomTypeId = validateRoomTypeId(id);

  const existingRoomType = await roomTypeRepository.getRoomTypeById(roomTypeId);

  if (!existingRoomType) {
    const error = new Error("Room type not found");
    error.status = 404;
    throw error;
  }

  const inUse = await roomTypeRepository.isRoomTypeInUse(roomTypeId);

  if (inUse) {
    const error = new Error(
      "Cannot delete room type because it is being used by rooms",
    );
    error.status = 409;
    throw error;
  }

  try {
    await roomTypeRepository.deleteRoomType(roomTypeId);
    return true;
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      const error = new Error(
        "Cannot delete room type because it is being used by rooms",
      );
      error.status = 409;
      throw error;
    }

    throw err;
  }
};
