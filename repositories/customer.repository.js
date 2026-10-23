import pool from "../configs/db.config.js";

export const findAllCustomers = async () => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, full_name, email, phone, address,
            identity_card, created_at, updated_at
     FROM customers
     ORDER BY id DESC`,
  );

  return rows;
};

export const findCustomerById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, full_name, email, phone, address,
            identity_card, created_at, updated_at
     FROM customers
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

export const findCustomerByUserId = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, full_name, email, phone, address,
            identity_card, created_at, updated_at
     FROM customers
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );

  return rows[0] || null;
};

export const createCustomer = async (customer, connection = pool) => {
  const { user_id, full_name, email, phone, address, identity_card } = customer;

  const [result] = await connection.execute(
    `INSERT INTO customers
      (user_id, full_name, email, phone, address, identity_card)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      user_id ?? null,
      full_name,
      email ?? null,
      phone ?? null,
      address ?? null,
      identity_card ?? null,
    ],
  );

  return findCustomerByIdWithConnection(result.insertId, connection);
};

const findCustomerByIdWithConnection = async (id, connection) => {
  const [rows] = await connection.execute(
    `SELECT id, user_id, full_name, email, phone, address,
            identity_card, created_at, updated_at
     FROM customers
     WHERE id = ?
     LIMIT 1`,
    [id],
  );

  return rows[0] || null;
};

export const updateCustomer = async (id, customer) => {
  const { full_name, email, phone, address, identity_card } = customer;

  await pool.execute(
    `UPDATE customers
     SET full_name = ?,
         email = ?,
         phone = ?,
         address = ?,
         identity_card = ?
     WHERE id = ?`,
    [
      full_name,
      email ?? null,
      phone ?? null,
      address ?? null,
      identity_card ?? null,
      id,
    ],
  );

  return findCustomerById(id);
};

export const deleteCustomer = async (id) => {
  const [result] = await pool.execute("DELETE FROM customers WHERE id = ?", [
    id,
  ]);

  return result.affectedRows > 0;
};
