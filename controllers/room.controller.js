import * as roomService from "../services/room.service.js";

// lay tat ca danh sach phong
export const getAllRooms = async (req, res, next) => {
  try {
    const result = await roomService.getAllRoomsService(req.query);

    res.status(200).json({
      success: true,
      message: "Get rooms successfully",
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// lay phong theo id
export const getRoomById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const room = await roomService.getRoomByIdService(id);

    res.status(200).json({
      success: true,
      message: "Get room successfully",
      data: room,
    });
  } catch (error) {
    next(error);
  }
};

// tao them phong
export const createRoom = async (req, res, next) => {
  try {
    const roomId = await roomService.createRoomService(req.body);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: {
        id: roomId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// cap nhat phong
export const updateRoom = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await roomService.updateRoomService(id, req.body);

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Xoa phong
export const deleteRoom = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await roomService.deleteRoomService(id);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
