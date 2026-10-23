import * as customerService from "../services/customer.service.js";

export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getAllCustomersService(req.user);

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerByIdService(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomerService(
      req.body,
      req.user,
    );

    res.status(201).json({
      success: true,
      message: "Tạo khách hàng thành công",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomerService(
      req.params.id,
      req.body,
      req.user,
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật khách hàng thành công",
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const result = await customerService.deleteCustomerService(
      req.params.id,
      req.user,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
