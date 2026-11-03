import * as channelService from "../services/channelManager.service.js";

// ==================== CHANNELS ====================

export const getChannels = async (req, res, next) => {
  try {
    const data = await channelService.getChannelsService();

    return res.status(200).json({
      success: true,
      message: "Get OTA Channels successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateChannelStatus = async (req, res, next) => {
  try {
    const data = await channelService.updateChannelStatusService(
      req.params.id,
      req.body.status,
    );

    return res.status(200).json({
      success: true,
      message: "Update OTA Channel status successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== MAPPINGS ====================

export const getMappings = async (req, res, next) => {
  try {
    const data = await channelService.getMappingsService(req.query);

    return res.status(200).json({
      success: true,
      message: "Get Room Mappings successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createMapping = async (req, res, next) => {
  try {
    const data = await channelService.createMappingService(req.body);

    return res.status(201).json({
      success: true,
      message: "Create Room Mapping successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMapping = async (req, res, next) => {
  try {
    const data = await channelService.updateMappingService(
      req.params.id,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Update Room Mapping successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMapping = async (req, res, next) => {
  try {
    const data = await channelService.deleteMappingService(req.params.id);

    return res.status(200).json({
      success: true,
      message: data.message,
      data: {
        id: data.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SYNC LOGS ====================

export const getSyncLogs = async (req, res, next) => {
  try {
    const data = await channelService.getSyncLogsService(req.query);

    return res.status(200).json({
      success: true,
      message: "Get Sync Logs successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
