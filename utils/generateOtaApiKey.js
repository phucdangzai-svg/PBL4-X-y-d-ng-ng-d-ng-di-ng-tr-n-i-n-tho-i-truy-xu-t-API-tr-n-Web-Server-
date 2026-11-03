import crypto from "node:crypto";
import pool from "../configs/db.config.js";

const generateApiKey = () => {
  return `ota_${crypto.randomBytes(32).toString("hex")}`;
};

const hashApiKey = (apiKey) => {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};

const generateOtaApiKeys = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [channels] = await connection.execute(
      `SELECT id, channel_code, name
       FROM ota_channels`,
    );

    if (channels.length === 0) {
      throw new Error("Chưa có OTA channel trong database");
    }

    const generatedKeys = [];

    for (const channel of channels) {
      const apiKey = generateApiKey();
      const apiKeyHash = hashApiKey(apiKey);

      await connection.execute(
        `UPDATE ota_channels
         SET api_key_hash = ?
         WHERE id = ?`,
        [apiKeyHash, channel.id],
      );

      generatedKeys.push({
        channel_code: channel.channel_code,
        name: channel.name,
        api_key: apiKey,
      });
    }

    await connection.commit();

    console.log("\n===== OTA API KEYS =====");

    for (const item of generatedKeys) {
      console.log(`\nChannel: ${item.name}`);
      console.log(`Code: ${item.channel_code}`);
      console.log(`API Key: ${item.api_key}`);
    }

    console.log("\nHãy lưu các API Key này. Chúng sẽ không được hiển thị lại.");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

generateOtaApiKeys().catch((error) => {
  console.error("Generate OTA API Keys failed:", error.message);
  process.exitCode = 1;
});
