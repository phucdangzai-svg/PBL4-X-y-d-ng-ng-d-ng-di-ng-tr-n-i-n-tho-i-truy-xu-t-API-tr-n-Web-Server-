import * as roomRepository from "../repositories/room.repository.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";
import { removeFile } from "../utils/file.js";

// Kiem tra du lieu phong
const validateRoomData = (room) => {
  const { room_number, room_type_id, price, status, description } = room;

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

  // Neu co loi, tra ve tat ca loi
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }
};

// Tao loi validation ID
const validateRoomId = (id) => {
  if (!Number.isInteger(id) || id <= 0) {
    const error = new Error("Invalid room ID");
    error.status = 400;
    throw error;
  }
};

// Lay tat ca phong theo danh sach
export const getAllRoomsService = async (filters = {}) => {
  const allowedStatuses = ["available", "occupied", "maintenance"];
  const errors = [];

  // 1. Kiem tra trang thai phong
  if (filters.status && !allowedStatuses.includes(filters.status)) {
    errors.push("Invalid room status");
  }

  // 2. Kiem tra loai phong
  if (
    filters.room_type_id !== undefined &&
    (filters.room_type_id === "" ||
      !Number.isInteger(Number(filters.room_type_id)) ||
      Number(filters.room_type_id) <= 0)
  ) {
    errors.push("Invalid room type ID");
  }

  // 3. Kiem tra page va limit
  const page = filters.page === undefined ? 1 : Number(filters.page);
  const limit = filters.limit === undefined ? 10 : Number(filters.limit);

  if (!Number.isInteger(page) || page <= 0) {
    errors.push("Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit <= 0 || limit > 100) {
    errors.push("Limit must be between 1 and 100");
  }

  // 4. Tra loi neu du lieu khong hop le
  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.status = 400;
    error.details = errors;
    throw error;
  }

  // 5. Chuan hoa bo loc
  const roomFilters = {
    status: filters.status,
    room_type_id:
      filters.room_type_id === undefined
        ? undefined
        : Number(filters.room_type_id),
  };

  // 6. Lay danh sach phong theo trang
  const rooms = await roomRepository.getAllRooms({
    ...roomFilters,
    limit,
    offset: (page - 1) * limit,
  });

  // 7. Dem tong so phong
  const totalItems = await roomRepository.countRooms(roomFilters);

  // 8. Tinh tong so trang
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    data: rooms,
  };
};

// Lay phong theo ID
export const getRoomByIdService = async (id) => {
  validateRoomId(id);

  const room = await roomRepository.getRoomById(id);

  if (!room) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  return room;
};

// Tao phong
export const createRoomService = async (room, file) => {
  let uploadedImage = null;

  try {
    validateRoomData(room);

    // Neu co anh thi upload len Cloudinary
    if (file) {
      uploadedImage = await uploadImage(file.path);
    }

    // Luu thong tin phong vao database
    return await roomRepository.createRoom({
      room_number: room.room_number.trim(),
      room_type_id: Number(room.room_type_id),
      price: Number(room.price),
      status: room.status,
      description: room.description?.trim() || null,
      image_url: uploadedImage?.image_url || null,
      image_public_id: uploadedImage?.image_public_id || null,
    });
  } catch (error) {
    // Neu database that bai thi xoa anh vua upload
    if (uploadedImage) {
      await deleteImage(uploadedImage.image_public_id).catch(() => {});
    }

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
  } finally {
    // Xoa file tam tren server
    await removeFile(file?.path).catch(() => {});
  }
};

// Cap nhat phong
export const updateRoomService = async (id, room, file) => {
  let uploadedImage = null;

  try {
    // 1. Kiem tra ID
    validateRoomId(id);

    // 2. Kiem tra phong ton tai
    const existingRoom = await roomRepository.getRoomById(id);

    if (!existingRoom) {
      const error = new Error("Room not found");
      error.status = 404;
      throw error;
    }

    // 3. Kiem tra du lieu
    validateRoomData(room);

    // 4. Neu co anh moi thi upload len Cloudinary
    if (file) {
      uploadedImage = await uploadImage(file.path);
    }

    // 5. Cap nhat database
    const updated = await roomRepository.updateRoom(id, {
      room_number: room.room_number.trim(),
      room_type_id: Number(room.room_type_id),
      price: Number(room.price),
      status: room.status,
      description: room.description?.trim() || null,

      // Khong co anh moi thi giu anh cu
      image_url: uploadedImage?.image_url || existingRoom.image_url,
      image_public_id:
        uploadedImage?.image_public_id || existingRoom.image_public_id,
    });

    // 6. Database cap nhat thanh cong moi xoa anh cu
    if (updated && uploadedImage && existingRoom.image_public_id) {
      await deleteImage(existingRoom.image_public_id).catch(() => {});
    }

    return updated;
  } catch (error) {
    // Neu cap nhat that bai thi xoa anh moi
    if (uploadedImage) {
      await deleteImage(uploadedImage.image_public_id).catch(() => {});
    }

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
  } finally {
    await removeFile(file?.path).catch(() => {});
  }
};

// Cap nhat anh phong rieng
export const updateRoomImageService = async (id, file) => {
  let uploadedImage = null;

  try {
    // 1. Kiem tra ID
    validateRoomId(id);

    // 2. Kiem tra file
    if (!file) {
      const error = new Error("Image file is required");
      error.status = 400;
      throw error;
    }

    // 3. Kiem tra phong ton tai
    const existingRoom = await roomRepository.getRoomById(id);

    if (!existingRoom) {
      const error = new Error("Room not found");
      error.status = 404;
      throw error;
    }

    // 4. Upload anh moi
    uploadedImage = await uploadImage(file.path);

    // 5. Cap nhat URL va public ID vao database
    const updated = await roomRepository.updateRoomImage(id, uploadedImage);

    if (!updated) {
      const error = new Error("Failed to update room image");
      error.status = 500;
      throw error;
    }

    // 6. Chi xoa anh cu sau khi database cap nhat thanh cong
    if (existingRoom.image_public_id) {
      await deleteImage(existingRoom.image_public_id).catch(() => {});
    }

    return uploadedImage;
  } catch (error) {
    // Neu that bai thi xoa anh moi vua upload
    if (uploadedImage) {
      await deleteImage(uploadedImage.image_public_id).catch(() => {});
    }

    throw error;
  } finally {
    await removeFile(file?.path).catch(() => {});
  }
};

// Xoa phong
export const deleteRoomService = async (id) => {
  validateRoomId(id);

  // 1. Kiem tra phong ton tai
  const existingRoom = await roomRepository.getRoomById(id);

  if (!existingRoom) {
    const error = new Error("Room not found");
    error.status = 404;
    throw error;
  }

  try {
    // 2. Xoa phong trong database
    const deleted = await roomRepository.deleteRoom(id);

    // 3. Xoa anh Cloudinary neu xoa phong thanh cong
    if (deleted && existingRoom.image_public_id) {
      await deleteImage(existingRoom.image_public_id).catch(() => {});
    }

    return deleted;
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
