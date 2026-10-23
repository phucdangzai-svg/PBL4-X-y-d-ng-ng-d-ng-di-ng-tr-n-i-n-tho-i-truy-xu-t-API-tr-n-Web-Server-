import * as roomTypeService from "../services/roomType.service.js";

/**
 * Trả về danh sách tất cả loại phòng.
 */
export const getAllRoomTypes = async (req, res, next) => {
  try {
    const data = await roomTypeService.getAllRoomTypesService();

    res.status(200).json({
      success: true,
      message: "Get room types successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trả về thông tin chi tiết một loại phòng.
 */
export const getRoomTypeById = async (req, res, next) => {
  try {
    const data = await roomTypeService.getRoomTypeByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Get room type successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo loại phòng mới.
 */
export const createRoomType = async (req, res, next) => {
  try {
    const data = await roomTypeService.createRoomTypeService(req.body);

    res.status(201).json({
      success: true,
      message: "Create room type successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật thông tin một loại phòng.
 */
export const updateRoomType = async (req, res, next) => {
  try {
    const data = await roomTypeService.updateRoomTypeService(
      req.params.id,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Update room type successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa một loại phòng.
 */
export const deleteRoomType = async (req, res, next) => {
  try {
    await roomTypeService.deleteRoomTypeService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Delete room type successfully",
    });
  } catch (error) {
    next(error);
  }
};
