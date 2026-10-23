import * as bookingRepository from "../repositories/booking.repository.js";

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseId = (value, fieldName) => {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw createError(`${fieldName} không hợp lệ`);
  }

  return id;
};

const parseDate = (value, fieldName) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createError(`${fieldName} phải có định dạng YYYY-MM-DD`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw createError(`${fieldName} không phải ngày hợp lệ`);
  }

  return date;
};

const getNightCount = (checkIn, checkOut) =>
  Math.round((checkOut - checkIn) / 86400000);

const isManager = (user) => ["owner", "admin"].includes(user.role);

const canViewBooking = (booking, user) =>
  isManager(user) || booking.customer_user_id === user.id;

export const getAllBookingsService = async (user) => {
  if (!isManager(user)) {
    return bookingRepository.findBookingsByCustomerUserId(user.id);
  }

  return bookingRepository.findAllBookings();
};

export const getBookingByIdService = async (id, user) => {
  const bookingId = parseId(id, "Booking ID");
  const booking = await bookingRepository.findBookingById(bookingId);

  if (!booking) {
    throw createError("Không tìm thấy booking", 404);
  }

  if (!canViewBooking(booking, user)) {
    throw createError("Bạn không có quyền xem booking này", 403);
  }

  return booking;
};

export const createBookingService = async (data, user) => {
  const roomId = parseId(data.room_id, "room_id");

  const checkInDate = parseDate(data.check_in, "check_in");
  const checkOutDate = parseDate(data.check_out, "check_out");

  if (checkOutDate <= checkInDate) {
    throw createError("check_out phải sau check_in");
  }

  if (
    data.note !== undefined &&
    data.note !== null &&
    typeof data.note !== "string"
  ) {
    throw createError("note phải là chuỗi hoặc null");
  }

  if (data.note && data.note.length > 2000) {
    throw createError("note không được vượt quá 2000 ký tự");
  }

  const checkIn = data.check_in;
  const checkOut = data.check_out;
  const nights = getNightCount(checkInDate, checkOutDate);

  return bookingRepository.withTransaction(async (connection) => {
    let customer;

    if (isManager(user)) {
      const customerId = parseId(data.customer_id, "customer_id");

      customer = await bookingRepository.findCustomerById(
        customerId,
        connection,
      );

      if (!customer) {
        throw createError("Không tìm thấy khách hàng", 404);
      }
    } else {
      customer = await bookingRepository.findCustomerByUserId(
        user.id,
        connection,
      );

      if (!customer) {
        throw createError(
          "Bạn cần tạo hồ sơ khách hàng trước khi đặt phòng",
          400,
        );
      }
    }

    const room = await bookingRepository.findRoomForBooking(roomId, connection);

    if (!room) {
      throw createError("Không tìm thấy phòng", 404);
    }

    if (room.status === "maintenance") {
      throw createError("Phòng đang bảo trì, không thể đặt", 409);
    }

    const overlappingBooking = await bookingRepository.findOverlappingBooking(
      roomId,
      checkIn,
      checkOut,
      connection,
    );

    if (overlappingBooking) {
      throw createError("Phòng đã có booking trùng khoảng ngày này", 409);
    }

    const pricePerNight = Number(room.price);

    if (!Number.isSafeInteger(pricePerNight) || pricePerNight <= 0) {
      throw createError("Giá phòng không hợp lệ", 400);
    }

    const totalPrice = pricePerNight * nights;

    if (!Number.isSafeInteger(totalPrice)) {
      throw createError("Tổng tiền vượt giới hạn cho phép", 400);
    }

    const bookingId = await bookingRepository.insertBooking(
      {
        customer_id: customer.id,
        room_id: roomId,
        price_per_night: pricePerNight,
        check_in: checkIn,
        check_out: checkOut,
        total_price: totalPrice,
        note: data.note?.trim() || null,
      },
      connection,
    );

    return bookingRepository.findBookingById(bookingId, connection);
  });
};

export const updateBookingStatusService = async (id, nextStatus, user) => {
  const bookingId = parseId(id, "Booking ID");

  const allowedStatuses = [
    "confirmed",
    "cancelled",
    "checked_in",
    "checked_out",
  ];

  if (!allowedStatuses.includes(nextStatus)) {
    throw createError("Trạng thái booking không hợp lệ");
  }

  return bookingRepository.withTransaction(async (connection) => {
    const booking = await bookingRepository.findBookingById(
      bookingId,
      connection,
    );

    if (!booking) {
      throw createError("Không tìm thấy booking", 404);
    }

    if (!isManager(user)) {
      if (booking.customer_user_id !== user.id) {
        throw createError("Bạn không có quyền thao tác booking này", 403);
      }

      if (nextStatus !== "cancelled") {
        throw createError("Guest chỉ được phép hủy booking", 403);
      }
    }

    const transitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["cancelled", "checked_in"],
      checked_in: ["checked_out"],
      checked_out: [],
      cancelled: [],
    };

    if (!transitions[booking.status]?.includes(nextStatus)) {
      throw createError(
        `Không thể chuyển trạng thái từ ${booking.status} sang ${nextStatus}`,
        409,
      );
    }

    if (nextStatus === "cancelled" && !isManager(user)) {
      const today = new Date().toISOString().slice(0, 10);

      if (booking.check_in <= today) {
        throw createError(
          "Guest không thể hủy booking vào ngày check-in hoặc sau đó",
          409,
        );
      }
    }

    if (nextStatus === "checked_in") {
      const today = new Date().toISOString().slice(0, 10);

      if (booking.check_in > today || booking.check_out <= today) {
        throw createError("Chỉ được check-in trong khoảng ngày đặt phòng", 409);
      }
    }

    if (nextStatus === "checked_out") {
      const today = new Date().toISOString().slice(0, 10);

      if (booking.check_out > today) {
        throw createError("Chưa đến ngày check-out của booking", 409);
      }
    }

    await bookingRepository.updateBookingStatus(
      bookingId,
      nextStatus,
      connection,
    );

    if (nextStatus === "checked_in") {
      await bookingRepository.updateRoomStatus(
        booking.room_id,
        "occupied",
        connection,
      );
    }

    if (nextStatus === "checked_out") {
      await bookingRepository.updateRoomStatus(
        booking.room_id,
        "available",
        connection,
      );
    }

    return bookingRepository.findBookingById(bookingId, connection);
  });
};
