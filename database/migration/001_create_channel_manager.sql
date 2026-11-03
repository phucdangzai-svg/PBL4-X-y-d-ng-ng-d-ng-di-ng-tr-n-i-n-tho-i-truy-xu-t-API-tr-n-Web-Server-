
USE hotel_pms;

-- 1. Danh sách các kênh OTA
CREATE TABLE ota_channels (
    id INT NOT NULL AUTO_INCREMENT,
    channel_code VARCHAR(30) NOT NULL,
    name VARCHAR(100) NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ota_channels_code (channel_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. Mapping loại phòng PMS với loại phòng OTA
CREATE TABLE ota_room_mappings (
    id INT NOT NULL AUTO_INCREMENT,
    channel_id INT NOT NULL,
    room_type_id INT NOT NULL,
    ota_room_code VARCHAR(100) NOT NULL,
    ota_room_name VARCHAR(150) NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_mapping_channel_room_type (channel_id, room_type_id),
    UNIQUE KEY uk_mapping_channel_ota_code (channel_id, ota_room_code),
    KEY idx_mapping_room_type (room_type_id),
    CONSTRAINT fk_mapping_channel
        FOREIGN KEY (channel_id) REFERENCES ota_channels(id),
    CONSTRAINT fk_mapping_room_type
        FOREIGN KEY (room_type_id) REFERENCES room_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 3. Booking nhận từ OTA
CREATE TABLE ota_bookings (
    id INT NOT NULL AUTO_INCREMENT,
    channel_id INT NOT NULL,
    booking_id INT NOT NULL,
    external_booking_id VARCHAR(100) NOT NULL,
    raw_data JSON DEFAULT NULL,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_ota_external_booking (channel_id, external_booking_id),
    UNIQUE KEY uk_ota_booking_id (booking_id),
    CONSTRAINT fk_ota_booking_channel
        FOREIGN KEY (channel_id) REFERENCES ota_channels(id),
    CONSTRAINT fk_ota_booking_pms
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 4. Nhật ký đồng bộ
CREATE TABLE sync_logs (
    id INT NOT NULL AUTO_INCREMENT,
    channel_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    status ENUM('success', 'failed') NOT NULL,
    external_booking_id VARCHAR(100) DEFAULT NULL,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_sync_logs_channel (channel_id),
    KEY idx_sync_logs_created_at (created_at),
    CONSTRAINT fk_sync_logs_channel
        FOREIGN KEY (channel_id) REFERENCES ota_channels(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
