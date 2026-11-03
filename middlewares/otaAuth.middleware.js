import crypto from "crypto";
import pool from "../configs/db.config.js";

export const otaAuthMiddleware = async (req, res, next) => {
  try {
    // 1. Lấy API Key từ Header
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: "Missing API Key",
      });
    }

    // 2. Hash API Key bằng SHA-256
    const apiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    // 3. Tìm channel tương ứng trong database
    const [channels] = await pool.query(
      `SELECT id, channel_code, name, status
       FROM ota_channels
       WHERE api_key_hash = ?
       LIMIT 1`,
      [apiKeyHash],
    );

    if (channels.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid API Key",
      });
    }

    const channel = channels[0];

    // 4. Kiểm tra trạng thái channel
    if (channel.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "OTA Channel is inactive",
      });
    }

    // 5. Gắn thông tin channel vào request
    req.channel = channel;

    next();
  } catch (err) {
    next(err);
  }
};
