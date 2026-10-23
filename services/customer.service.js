import * as customerRepository from "../repositories/customer.repository.js";

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const validateId = (id) => {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw createError("Customer ID không hợp lệ", 400);
  }

  return parsedId;
};

const validateCustomerData = (data) => {
  const { full_name, email, phone, address, identity_card } = data;

  if (
    typeof full_name !== "string" ||
    !full_name.trim() ||
    full_name.trim().length > 255
  ) {
    throw createError("full_name là bắt buộc và tối đa 255 ký tự");
  }

  for (const [field, value, maxLength] of [
    ["email", email, 255],
    ["phone", phone, 20],
    ["address", address, 255],
    ["identity_card", identity_card, 20],
  ]) {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value !== "string" || value.length > maxLength)
    ) {
      throw createError(`${field} không hợp lệ hoặc vượt quá độ dài cho phép`);
    }
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError("Email không hợp lệ");
  }

  return {
    full_name: full_name.trim(),
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    address: address?.trim() || null,
    identity_card: identity_card?.trim() || null,
  };
};

const canManageAllCustomers = (user) => ["owner", "admin"].includes(user.role);

export const getAllCustomersService = async (user) => {
  if (!canManageAllCustomers(user)) {
    throw createError("Bạn không có quyền xem danh sách khách hàng", 403);
  }

  return customerRepository.findAllCustomers();
};

export const getCustomerByIdService = async (id, user) => {
  const customerId = validateId(id);
  const customer = await customerRepository.findCustomerById(customerId);

  if (!customer) {
    throw createError("Không tìm thấy khách hàng", 404);
  }

  if (!canManageAllCustomers(user) && customer.user_id !== user.id) {
    throw createError("Bạn không có quyền xem hồ sơ khách hàng này", 403);
  }

  return customer;
};

export const createCustomerService = async (data, user) => {
  const customerData = validateCustomerData(data);

  if (canManageAllCustomers(user)) {
    if (data.user_id !== undefined && data.user_id !== null) {
      const userId = Number(data.user_id);

      if (!Number.isInteger(userId) || userId <= 0) {
        throw createError("user_id không hợp lệ");
      }

      customerData.user_id = userId;
    } else {
      customerData.user_id = null;
    }
  } else {
    customerData.user_id = user.id;

    const existingCustomer = await customerRepository.findCustomerByUserId(
      user.id,
    );

    if (existingCustomer) {
      throw createError("Tài khoản đã có hồ sơ khách hàng", 409);
    }
  }

  try {
    return await customerRepository.createCustomer(customerData);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createError("Email hoặc thông tin khách hàng đã tồn tại", 409);
    }

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw createError("user_id không tồn tại", 400);
    }

    throw error;
  }
};

export const updateCustomerService = async (id, data, user) => {
  const customerId = validateId(id);
  const existingCustomer =
    await customerRepository.findCustomerById(customerId);

  if (!existingCustomer) {
    throw createError("Không tìm thấy khách hàng", 404);
  }

  if (!canManageAllCustomers(user) && existingCustomer.user_id !== user.id) {
    throw createError("Bạn không có quyền sửa hồ sơ khách hàng này", 403);
  }

  const customerData = validateCustomerData(data);

  try {
    return await customerRepository.updateCustomer(customerId, customerData);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw createError("Email hoặc thông tin khách hàng đã tồn tại", 409);
    }

    throw error;
  }
};

export const deleteCustomerService = async (id, user) => {
  const customerId = validateId(id);

  if (!canManageAllCustomers(user)) {
    throw createError("Chỉ owner/admin được xóa hồ sơ khách hàng", 403);
  }

  const customer = await customerRepository.findCustomerById(customerId);

  if (!customer) {
    throw createError("Không tìm thấy khách hàng", 404);
  }

  try {
    await customerRepository.deleteCustomer(customerId);
    return { message: "Xóa khách hàng thành công" };
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw createError(
        "Không thể xóa khách hàng vì đã có booking liên quan",
        409,
      );
    }

    throw error;
  }
};
