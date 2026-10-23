import bcrypt from "bcrypt";
import pool from "../../configs/db.config.js";

const testUsers = [
  {
    username: "admin_test",
    password: "Admin123456",
    full_name: "Admin Test",
    email: "admin_test@example.com",
    phone: "0900000002",
    role: "admin",
  },
  {
    username: "owner_test",
    password: "Owner123456",
    full_name: "Owner Test",
    email: "owner_test@example.com",
    phone: "0900000003",
    role: "owner",
  },
];

const seedUsers = async () => {
  try {
    for (const user of testUsers) {
      // Tim role theo ten
      const [roles] = await pool.execute(
        "SELECT id FROM roles WHERE name = ? LIMIT 1",
        [user.role],
      );

      if (roles.length === 0) {
        throw new Error(`Role '${user.role}' khong ton tai.`);
      }

      // Kiem tra tai khoan da ton tai
      const [existingUsers] = await pool.execute(
        "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
        [user.username, user.email],
      );

      if (existingUsers.length > 0) {
        console.log(`Bo qua '${user.username}': tai khoan da ton tai.`);
        continue;
      }

      // Ma hoa mat khau bang bcrypt
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await pool.execute(
        `INSERT INTO users
          (username, password, full_name, email, phone, role_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.username,
          hashedPassword,
          user.full_name,
          user.email,
          user.phone,
          roles[0].id,
          1,
        ],
      );

      console.log(`Da tao '${user.username}' voi role '${user.role}'.`);
    }
  } catch (error) {
    console.error("Seed users that bai:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

seedUsers();
