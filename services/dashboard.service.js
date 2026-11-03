import * as dashboardRepository from "../repositories/dashboard.repository.js";

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  return error;
};

// Tạo danh sách ngày theo múi giờ local của MySQL Server
const getDateRange = (days) => {
  const dates = [];
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

export const getDashboardOverviewService = async (period) => {
  const periodDays = {
    today: 1,
    "7days": 7,
    "30days": 30,
  };

  const days = periodDays[period || "7days"];

  if (!days) {
    throw createError(
      "Period không hợp lệ. Chỉ hỗ trợ today, 7days, 30days",
      400,
    );
  }

  const [summary, occupancy, bookingTrendRows, bookingStatus, recentBookings] =
    await Promise.all([
      dashboardRepository.getDashboardSummary(),
      dashboardRepository.getRoomOccupancy(),
      dashboardRepository.getBookingTrend(days),
      dashboardRepository.getBookingStatus(days),
      dashboardRepository.getRecentBookings(),
    ]);

  // Bổ sung các ngày không có booking với total = 0
  const bookingMap = new Map(
    bookingTrendRows.map((item) => {
      const date =
        item.date instanceof Date
          ? item.date.toISOString().slice(0, 10)
          : String(item.date).slice(0, 10);

      return [date, Number(item.total)];
    }),
  );

  const bookingTrend = getDateRange(days).map((date) => ({
    date,
    total: bookingMap.get(date) || 0,
  }));

  // Chuẩn hóa kiểu dữ liệu số
  const normalizedSummary = Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [key, Number(value)]),
  );

  return {
    summary: normalizedSummary,

    occupancy: occupancy.map((item) => ({
      status: item.status,
      total: Number(item.total),
    })),

    bookingTrend,

    bookingStatus: bookingStatus.map((item) => ({
      status: item.status,
      total: Number(item.total),
    })),

    recentBookings,
  };
};
