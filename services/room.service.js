import * as roomRepository from "../repositories/room.repository.js";

// Kiem tra du lieu phong
const validateRoomData = (room) => {
  const { room_number, room_type_id, price, status, description, image_url } =
    room;

  const errors = [];

  // 1. Kiem tra so phong
  if (typeof room_number !== "string" || room_number.trim() === "") {
    errors.push("Room number is required");
  }

  // 2. Kiem tra loai phong
  if (
    room_type_id === undefined ||
    room_type_id === null ||
    !Number.isInteger(Number(room_type_id)) ||
    Number(room_type_id) <= 0
  ) {
    errors.push("Invalid room type ID");
  }

  // 3. Kiem tra gia phong
  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) <= 0
  ) {
    errors.push("Price must be greater than 0");
  }

  // 4. Kiem tra trang thai
  const allowedStatuses = ["available", "occupied", "maintenance"];

  if (!allowedStatuses.includes(status)) {
    errors.push("Invalid room status");
  }

  // 5. Kiem tra mo ta
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    errors.push("Description must be a string");
  }

  // 6. Kiem tra URL anh
  if (
    image_url !== undefined &&
    image_url !== null &&
    typeof image_url !== "string"
  ) {
    errors.push("Image URL must be a string");
  }

  // Neu co loi, tra ve tat ca loi
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }
};

// lay tat ca phong theo danh sach
export const getAllRoomsService = async (filters = {}) => {
  const allowedStatuses = ["available", "occupied", "maintenance"];
  const errors = [];

  // 1. Kiểm tra trạng thái phòng
  if (filters.status && !allowedStatuses.includes(filters.status)) {
    errors.push("Invalid room status");
  }

  // 2. Kiểm tra loại phòng
  if (
    filters.room_type_id !== undefined &&
    (filters.room_type_id === "" ||
      !Number.isInteger(Number(filters.room_type_id)) ||
      Number(filters.room_type_id) <= 0)
  ) {
    errors.push("Invalid room type ID");
  }

  // 3. Kiểm tra page và limit
  const page = filters.page === undefined ? 1 : Number(filters.page);
  const limit = filters.limit === undefined ? 10 : Number(filters.limit);

  if (!Number.isInteger(page) || page <= 0) {
    errors.push("Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    errors.push("Limit must be between 1 and 100");
  }

  // 4. Trả lỗi nếu dữ liệu không hợp lệ
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  // 5. Chuẩn hóa bộ lọc để dùng chung
  const roomFilters = {
    status: filters.status,
    room_type_id:
      filters.room_type_id === undefined
        ? undefined
        : Number(filters.room_type_id),
  };

  // 6. Lấy danh sách phòng theo trang
  const rooms = await roomRepository.getAllRooms({
    ...roomFilters,
    limit,
    offset: (page - 1) * limit,
  });

  // 7. Đếm tổng số phòng theo cùng điều kiện lọc
  const totalItems = await roomRepository.countRooms(roomFilters);

  // 8. Tính tổng số trang
  const totalPages = Math.ceil(totalItems / limit);

  // 9. Trả kết quả
  return {
    page,
    limit,
    totalItems,
    totalPages,
    data: rooms,
  };
};

// lay danh sach theo id
export const getRoomByIdService = async (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid room ID");
    error.status = 400;
    throw error;
  }

  const room = await roomRepository.getRoomById(id);

  if (!room) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  return room;
};

// tao them phong

export const createRoomService = async (room) => {
  validateRoomData(room);

  try {
    return await roomRepository.createRoom({
      room_number: room.room_number.trim(),
      room_type_id: Number(room.room_type_id),
      price: Number(room.price),
      status: room.status,
      description: room.description?.trim() || null,
      image_url: room.image_url?.trim() || null,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const duplicateError = new Error("Room number already exists");
      duplicateError.status = 409;
      throw duplicateError;
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      const typeError = new Error("Room type does not exist");
      typeError.status = 400;
      throw typeError;
    }
    throw error;
  }
};

// cap nhat phong
export const updateRoomService = async (id, room) => {
  // 1. Kiem tra ID
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid room ID");
    error.status = 400;
    throw error;
  }

  // 2. Kiem tra phong co ton tai khong
  const existingRoom = await roomRepository.getRoomById(id);

  if (!existingRoom) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  // 3. Kiem tra du lieu cap nhat
  validateRoomData(room);

  // 4. Cap nhat phong
  try {
    return await roomRepository.updateRoom(id, {
      room_number: room.room_number.trim(),
      room_type_id: Number(room.room_type_id),
      price: Number(room.price),
      status: room.status,
      description: room.description?.trim() || null,
      image_url: room.image_url?.trim() || null,
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const duplicateError = new Error(
        "Another room already uses this room number",
      );
      duplicateError.status = 409;
      throw duplicateError;
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      const typeError = new Error("Room type does not exist");
      typeError.status = 400;
      throw typeError;
    }

    throw error;
  }
};

// Xoa phong
export const deleteRoomService = async (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid room ID");
    error.status = 400;
    throw error;
  }

  // Kiem tra phong co ton tai khong
  const existingRoom = await roomRepository.getRoomById(id);

  if (!existingRoom) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  try {
    return await roomRepository.deleteRoom(id);
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      const deleteError = new Error(
        "Cannot delete room because it is associated with a booking",
      );
      deleteError.status = 409;
      throw deleteError;
    }

    throw error;
  }
};
