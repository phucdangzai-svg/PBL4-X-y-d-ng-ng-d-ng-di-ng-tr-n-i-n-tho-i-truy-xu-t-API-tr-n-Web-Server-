import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardOverview = async (req, res, next) => {
  try {
    const period = req.query.period || "7days";

    const data = await dashboardService.getDashboardOverviewService(period);

    res.status(200).json({
      success: true,
      message: "Lấy thống kê Dashboard thành công",
      data,
    });
  } catch (error) {
    next(error);
  }
};
