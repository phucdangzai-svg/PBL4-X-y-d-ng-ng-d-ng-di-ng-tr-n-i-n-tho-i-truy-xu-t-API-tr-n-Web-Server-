import * as bookingRepository from "../repositories/booking.repository.js";
import * as otaBookingRepository from "../repositories/otaBooking.repository.js";

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
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

const validateOtaBookingData = (data) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw createError("Dữ liệu booking không hợp lệ");
  }

  const { external_booking_id, room_code, customer } = data;

  if (
    typeof external_booking_id !== "string" ||
    !external_booking_id.trim() ||
    external_booking_id.length > 255
  ) {
    throw createError("external_booking_id không hợp lệ");
  }

  if (
    typeof room_code !== "string" ||
    !room_code.trim() ||
    room_code.length > 100
  ) {
    throw createError("room_code không hợp lệ");
  }

  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    throw createError("Thông tin customer không hợp lệ");
  }

  if (typeof customer.full_name !== "string" || !customer.full_name.trim()) {
    throw createError("full_name không được để trống");
  }

  if (customer.full_name.trim().length > 255) {
    throw createError("full_name không được vượt quá 255 ký tự");
  }

  const email =
    typeof customer.email === "string"
      ? customer.email.trim().toLowerCase()
      : "";

  const phone = typeof customer.phone === "string" ? customer.phone.trim() : "";

  if (
    customer.email !== undefined &&
    customer.email !== null &&
    typeof customer.email !== "string"
  ) {
    throw createError("email phải là chuỗi");
  }

  if (
    customer.phone !== undefined &&
    customer.phone !== null &&
    typeof customer.phone !== "string"
  ) {
    throw createError("phone phải là chuỗi");
  }

  if (!email && !phone) {
    throw createError("Khách hàng phải có email hoặc số điện thoại");
  }

  if (email.length > 255 || phone.length > 20) {
    throw createError("Email hoặc số điện thoại vượt quá giới hạn");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError("Email không hợp lệ");
  }

  if (
    data.note !== undefined &&
    data.note !== null &&
    typeof data.note !== "string"
  ) {
    throw createError("note phải là chuỗi hoặc null");
  }

  if (typeof data.note === "string" && data.note.length > 2000) {
    throw createError("note không được vượt quá 2000 ký tự");
  }

  const checkInDate = parseDate(data.check_in, "check_in");
  const checkOutDate = parseDate(data.check_out, "check_out");

  if (checkOutDate <= checkInDate) {
    throw createError("check_out phải sau check_in");
  }

  return {
    external_booking_id: external_booking_id.trim(),
    room_code: room_code.trim(),
    customer: {
      full_name: customer.full_name.trim(),
      email: email || null,
      phone: phone || null,
    },
    check_in: data.check_in,
    check_out: data.check_out,
    checkInDate,
    checkOutDate,
    note: data.note?.trim() || null,
  };
};

export const createOtaBookingService = async (data, channel) => {
  if (!channel?.id || !channel?.channel_code) {
    throw createError("OTA Channel không hợp lệ", 401);
  }

  const input = validateOtaBookingData(data);
  const channelId = channel.id;

  try {
    return await bookingRepository.withTransaction(async (connection) => {
      // 1. Kiểm tra đơn OTA đã tồn tại
      const existingOtaBooking =
        await otaBookingRepository.findOtaBookingByExternalId(
          channelId,
          input.external_booking_id,
          connection,
        );

      if (existingOtaBooking) {
        throw createError("OTA Booking đã tồn tại", 409);
      }

      // 2. Ánh xạ room_code sang room_type_id
      const mapping = await otaBookingRepository.findOtaRoomMapping(
        channelId,
        input.room_code,
        connection,
      );

      if (!mapping) {
        throw createError("Không tìm thấy ánh xạ loại phòng OTA", 404);
      }

      // 3. Tìm các phòng vật lý thuộc loại phòng này
      const candidates = await otaBookingRepository.findRoomCandidatesByType(
        mapping.room_type_id,
        connection,
      );

      if (candidates.length === 0) {
        throw createError("Không có phòng phù hợp", 409);
      }

      // 4. Lần lượt khóa phòng và kiểm tra lịch đặt
      let selectedRoom = null;

      for (const candidate of candidates) {
        const room = await bookingRepository.findRoomForBooking(
          candidate.id,
          connection,
        );

        if (!room || room.status === "maintenance") {
          continue;
        }

        const overlappingBooking =
          await bookingRepository.findOverlappingBooking(
            room.id,
            input.check_in,
            input.check_out,
            connection,
          );

        if (!overlappingBooking) {
          selectedRoom = room;
          break;
        }
      }

      if (!selectedRoom) {
        throw createError("Không còn phòng trống trong khoảng ngày này", 409);
      }

      // 5. Tìm hoặc tạo khách hàng
      const customers = await otaBookingRepository.findCustomerByEmailOrPhone(
        input.customer.email,
        input.customer.phone,
        connection,
      );

      const uniqueCustomerIds = [
        ...new Set(customers.map((customer) => customer.id)),
      ];

      if (uniqueCustomerIds.length > 1) {
        throw createError(
          "Email và số điện thoại thuộc hai khách hàng khác nhau",
          409,
        );
      }

      let customerId;

      if (uniqueCustomerIds.length === 1) {
        customerId = uniqueCustomerIds[0];
      } else {
        customerId = await otaBookingRepository.createCustomer(
          input.customer,
          connection,
        );
      }

      // 6. Tính tiền theo giá phòng của PMS
      const pricePerNight = Number(selectedRoom.price);

      if (!Number.isSafeInteger(pricePerNight) || pricePerNight <= 0) {
        throw createError("Giá phòng trong PMS không hợp lệ", 400);
      }

      const nights = getNightCount(input.checkInDate, input.checkOutDate);

      const totalPrice = pricePerNight * nights;

      if (!Number.isSafeInteger(totalPrice)) {
        throw createError("Tổng tiền vượt giới hạn cho phép", 400);
      }

      // 7. Tạo PMS Booking
      const bookingId = await bookingRepository.insertBooking(
        {
          customer_id: customerId,
          room_id: selectedRoom.id,
          price_per_night: pricePerNight,
          check_in: input.check_in,
          check_out: input.check_out,
          total_price: totalPrice,
          status: "confirmed",
          note: input.note,
        },
        connection,
      );

      // 8. Lưu liên kết OTA Booking
      await otaBookingRepository.insertOtaBooking(
        {
          channel_id: channelId,
          booking_id: bookingId,
          external_booking_id: input.external_booking_id,
          raw_data: data,
        },
        connection,
      );

      // 9. Ghi log thành công
      await otaBookingRepository.insertSyncLog(
        {
          channel_id: channelId,
          event_type: "booking_received",
          status: "success",
          external_booking_id: input.external_booking_id,
          message: "OTA Booking received successfully",
        },
        connection,
      );

      // 10. Trả về thông tin PMS Booking
      const booking = await bookingRepository.findBookingById(
        bookingId,
        connection,
      );

      return {
        booking_id: bookingId,
        external_booking_id: input.external_booking_id,
        channel_code: channel.channel_code,
        room_number: selectedRoom.room_number,
        price_per_night: pricePerNight,
        total_price: totalPrice,
        status: "confirmed",
        booking,
      };
    });
  } catch (error) {
    // Transaction đã rollback trước khi chạy đến đây.
    // Ghi log thất bại bằng pool bên ngoài transaction.
    try {
      await otaBookingRepository.insertSyncLog({
        channel_id: channelId,
        event_type: "booking_received",
        status: "failed",
        external_booking_id: input.external_booking_id,
        message: error.message,
      });
    } catch (logError) {
      console.error("Failed to write OTA sync log:", logError);
    }

    // Hai unique constraint có thể phát hiện request trùng
    // trong trường hợp hai request đến đồng thời.
    if (error.code === "ER_DUP_ENTRY") {
      throw createError("OTA Booking đã tồn tại", 409);
    }

    throw error;
  }
};
