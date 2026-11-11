-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: hotel_pms
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking_room_history`
--

DROP TABLE IF EXISTS `booking_room_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_room_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `room_id` int NOT NULL,
  `old_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `booking_room_history_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `booking_room_history_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_room_history`
--

LOCK TABLES `booking_room_history` WRITE;
/*!40000 ALTER TABLE `booking_room_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_room_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_services`
--

DROP TABLE IF EXISTS `booking_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `service_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(12,2) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `booking_services_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `booking_services_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  CONSTRAINT `chk_service_quantity` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_services`
--

LOCK TABLES `booking_services` WRITE;
/*!40000 ALTER TABLE `booking_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `room_id` int NOT NULL,
  `price_per_night` decimal(12,0) NOT NULL DEFAULT '0',
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `total_price` decimal(12,0) NOT NULL DEFAULT '0',
  `status` enum('pending','confirmed','checked_in','checked_out','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
  CONSTRAINT `chk_booking_dates` CHECK ((`check_out` > `check_in`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,0,'2026-11-01','2026-11-03',1000000,'cancelled','Booking test DELETE','2026-10-13 00:30:14','2026-10-19 23:51:55'),(2,1,1,600000,'2026-11-10','2026-11-12',1200000,'cancelled','Dat phong thu nghiem','2026-10-19 23:20:30','2026-11-01 00:47:18'),(3,3,3,500000,'2026-11-01','2026-11-04',1500000,'checked_in','vip','2026-11-01 00:44:05','2026-11-01 00:47:38'),(4,3,8,650000,'2026-11-06','2026-11-12',3900000,'pending',NULL,'2026-11-01 00:52:00','2026-11-01 00:52:00'),(5,3,18,4000000,'2026-11-01','2026-12-05',136000000,'confirmed',NULL,'2026-11-01 00:55:11','2026-11-01 00:55:11'),(6,4,3,500000,'2026-11-10','2026-11-12',1000000,'confirmed','Test booking from Booking.com','2026-11-02 22:38:28','2026-11-02 22:38:28');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `identity_card` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,1,'Nguyen Van A Updated','nguyenvana.updated@example.com','0912345678','Ho Chi Minh City','123456789012','2026-10-13 00:27:20','2026-10-19 20:38:56'),(3,NULL,'Nguyễn Đăng Phúc','phucdangzai@gmail.com','0355765046','Quảng Trị','045206001175','2026-11-01 00:23:26','2026-11-01 00:24:14'),(4,NULL,'Nguyen Van A','nguyenvana@example.com','0901234567',NULL,NULL,'2026-11-02 22:38:28','2026-11-02 22:38:28');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ota_bookings`
--

DROP TABLE IF EXISTS `ota_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ota_bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `booking_id` int NOT NULL,
  `external_booking_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `raw_data` json DEFAULT NULL,
  `received_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ota_external_booking` (`channel_id`,`external_booking_id`),
  UNIQUE KEY `uk_ota_booking_id` (`booking_id`),
  CONSTRAINT `fk_ota_booking_channel` FOREIGN KEY (`channel_id`) REFERENCES `ota_channels` (`id`),
  CONSTRAINT `fk_ota_booking_pms` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ota_bookings`
--

LOCK TABLES `ota_bookings` WRITE;
/*!40000 ALTER TABLE `ota_bookings` DISABLE KEYS */;
INSERT INTO `ota_bookings` VALUES (1,1,6,'BOOKING-TEST-001','{\"note\": \"Test booking from Booking.com\", \"check_in\": \"2026-11-10\", \"customer\": {\"email\": \"nguyenvana@example.com\", \"phone\": \"0901234567\", \"full_name\": \"Nguyen Van A\"}, \"check_out\": \"2026-11-12\", \"room_code\": \"BK_DLX\", \"external_booking_id\": \"BOOKING-TEST-001\"}','2026-11-02 22:38:28');
/*!40000 ALTER TABLE `ota_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ota_channels`
--

DROP TABLE IF EXISTS `ota_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ota_channels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `api_key_hash` char(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ota_channels_code` (`channel_code`),
  UNIQUE KEY `api_key_hash` (`api_key_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ota_channels`
--

LOCK TABLES `ota_channels` WRITE;
/*!40000 ALTER TABLE `ota_channels` DISABLE KEYS */;
INSERT INTO `ota_channels` VALUES (1,'BOOKING','Booking.com','active','2026-11-02 16:54:34','2026-11-03 22:22:37','a35176f415dab54296c4532a07801661ca228c29fb2b05920fc99fe783ed4f08'),(2,'AGODA','Agoda','active','2026-11-02 16:54:34','2026-11-02 21:45:05','edb560026c1b6994d07a05e7533a24f84ebb0e49790e30a480d6742d97acf081'),(3,'TRAVELOKA','Traveloka','active','2026-11-02 16:54:34','2026-11-03 21:03:52','d52db9d323fe76d25b89239a0746cf0b7e34c932509f7f4241d38946c92fa732');
/*!40000 ALTER TABLE `ota_channels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ota_room_mappings`
--

DROP TABLE IF EXISTS `ota_room_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ota_room_mappings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `ota_room_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ota_room_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mapping_channel_room_type` (`channel_id`,`room_type_id`),
  UNIQUE KEY `uk_mapping_channel_ota_code` (`channel_id`,`ota_room_code`),
  KEY `idx_mapping_room_type` (`room_type_id`),
  CONSTRAINT `fk_mapping_channel` FOREIGN KEY (`channel_id`) REFERENCES `ota_channels` (`id`),
  CONSTRAINT `fk_mapping_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ota_room_mappings`
--

LOCK TABLES `ota_room_mappings` WRITE;
/*!40000 ALTER TABLE `ota_room_mappings` DISABLE KEYS */;
INSERT INTO `ota_room_mappings` VALUES (1,1,1,'BK_TEST_UPDATED','Standard Test Updated','active','2026-11-02 17:19:03','2026-11-03 21:21:03'),(2,1,2,'BK_DLX','Deluxe Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03'),(3,1,3,'BK_SUI','Suite Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03'),(4,2,1,'AG_STD','Standard Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03'),(5,2,2,'AG_DLX','Deluxe Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03'),(6,2,3,'AG_SUI','Suite Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03'),(7,3,1,'TR_STD','Standard Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03'),(8,3,2,'TR_DLX','Deluxe Room','active','2026-11-02 17:19:03','2026-11-02 17:19:03');
/*!40000 ALTER TABLE `ota_room_mappings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=90 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (2,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyMzk1MDcwLCJleHAiOjE3OTI5OTk4NzB9.AZrAPANKJYgopIwObdXheDFF_5xdsrPKcge-PLlOXi0','2026-10-26 14:31:10','2026-10-19 14:31:10'),(3,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyMzk1MjQzLCJleHAiOjE3OTMwMDAwNDN9.4v1N9htnuLPIG1XPDB8BAodpVl_iCsHgZvYNu3YksHQ','2026-10-26 14:34:03','2026-10-19 14:34:03'),(4,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyMzk1NTQzLCJleHAiOjE3OTMwMDAzNDN9.o1nAnPLU1vEOc9CBQfZbaHjITE5pp6kwe6ZiXG5pRiE','2026-10-26 14:39:03','2026-10-19 14:39:03'),(6,8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiaWF0IjoxNzkyMzk5OTg0LCJleHAiOjE3OTMwMDQ3ODR9.tcBttEIZSA1emdPuL1SihQl9CUXNM1oPz4lxQh5AjA4','2026-10-26 15:53:04','2026-10-19 15:53:05'),(7,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAwMzM4LCJleHAiOjE3OTMwMDUxMzh9.QRVH6QsLQCy2jjdoCnjbn9HzBJ143HQs12V4v526uGs','2026-10-26 15:58:58','2026-10-19 15:58:58'),(8,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAwODE1LCJleHAiOjE3OTMwMDU2MTV9.nL-sMEshufxchhtls8ll7cCH69wKnGObbXHZeuGJvZc','2026-10-26 16:06:55','2026-10-19 16:06:55'),(9,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAwOTk3LCJleHAiOjE3OTMwMDU3OTd9.WHabZwvqiu8QswMh72LVt0RvSqzYfgfIEtrmpnvzPQs','2026-10-26 16:09:57','2026-10-19 16:09:57'),(10,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAxMTU4LCJleHAiOjE3OTMwMDU5NTh9.3w9pwHZ10AVwNYJpvMM9LIq5sGRayoEPFO7nHsiHGvY','2026-10-26 16:12:38','2026-10-19 16:12:38'),(11,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAxMjEyLCJleHAiOjE3OTMwMDYwMTJ9.gC2Jay7wdjl9qvJX7vFtYIzan-qlEt6cJgW9rSI7tRM','2026-10-26 16:13:32','2026-10-19 16:13:32'),(12,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAxMzMyLCJleHAiOjE3OTMwMDYxMzJ9.nU3m68-e11CZZJ0Os_5M2gVUa2tKMDyGCGUi4yqa1zc','2026-10-26 16:15:32','2026-10-19 16:15:32'),(13,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAxNjc4LCJleHAiOjE3OTMwMDY0Nzh9.YNEN9v-7qxYV4B50tcBJLPV_QVu4BFlUwL6FaHb6Nng','2026-10-26 16:21:18','2026-10-19 16:21:18'),(14,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDAyMjM2LCJleHAiOjE3OTMwMDcwMzZ9.jWLCQRpCfmbvPt-6nH9vRLiAeUGW-a-LL63kUSGQrAY','2026-10-26 16:30:36','2026-10-19 16:30:36'),(15,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyNDE2MjY4LCJleHAiOjE3OTMwMjEwNjh9.RwfefYJgWtqmiyA3P9JlnNqCb8uzaa2jCd-bGFti3yY','2026-10-26 20:24:28','2026-10-19 20:24:28'),(16,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyNDE2NDI4LCJleHAiOjE3OTMwMjEyMjh9.I6Tsl_yWleSWq8rxhwWvEAMhL6t-R0mPxyDH7cXo1JA','2026-10-26 20:27:08','2026-10-19 20:27:08'),(17,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDE2NjIyLCJleHAiOjE3OTMwMjE0MjJ9.0IFoM8kCu0_EL1yP4AeMJ5NFqw3GtGNyJaQUVyzxXt8','2026-10-26 20:30:22','2026-10-19 20:30:22'),(18,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDE2ODQ1LCJleHAiOjE3OTMwMjE2NDV9.ZA0z7FTSaQuUHSXgNGfMA0tFnX_rt8zT7wpMPSUOb0Q','2026-10-26 20:34:05','2026-10-19 20:34:05'),(19,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDE2OTc1LCJleHAiOjE3OTMwMjE3NzV9.jgC8xWCVbjNnGtHg-cUmdptcESSeZkI9mdPViEw_9NE','2026-10-26 20:36:15','2026-10-19 20:36:15'),(20,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDE3MTE0LCJleHAiOjE3OTMwMjE5MTR9.rP8nQnDFcHGtxrkSaggmycwWj-4XzciFAwe_F9Agt0Y','2026-10-26 20:38:34','2026-10-19 20:38:34'),(21,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDE3MjA0LCJleHAiOjE3OTMwMjIwMDR9.ze7ZIwOKsMDGApXr7PUNN8sIrKIufrOG98ZSYfhdATM','2026-10-26 20:40:04','2026-10-19 20:40:04'),(22,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDI2NjkwLCJleHAiOjE3OTMwMzE0OTB9.Uh3CRiEzVDIyD_DF4P0wfvj9h1ByCD5pEqShx6DqW4M','2026-10-26 23:18:10','2026-10-19 23:18:10'),(23,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDI3OTkyLCJleHAiOjE3OTMwMzI3OTJ9.ebIr04oDbZKrBV1WkiU3_3XTDR0fzHtr_KqUr02HVfU','2026-10-26 23:39:52','2026-10-19 23:39:52'),(24,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNDI4NjEzLCJleHAiOjE3OTMwMzM0MTN9.jTIajkmzYQF1C04YJROZC4nE9lxG7vR7YY10SAarGbw','2026-10-26 23:50:13','2026-10-19 23:50:13'),(25,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyNjM3NTAwLCJleHAiOjE3OTMyNDIzMDB9.whqC84HDanuQYrznijoe-PANwRwfWIJVz8b73wynwUg','2026-10-29 09:51:40','2026-10-22 09:51:40'),(26,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyNjM4MzI4LCJleHAiOjE3OTMyNDMxMjh9.6tGz9p4G3JJ_xkp5X9wy6kE3git1Xl1F96UhlgysxNs','2026-10-29 10:05:28','2026-10-22 10:05:28'),(27,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyNjQwMzEyLCJleHAiOjE3OTMyNDUxMTJ9.m-tYmgKdxBAdWb38ZFEhwKnb3zhqiHdQ30NCPl4hTz4','2026-10-29 10:38:32','2026-10-22 10:38:32'),(28,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNjQwNDYwLCJleHAiOjE3OTMyNDUyNjB9.xcoU3V84JG9erURIftV7W3BLwHe14fnQpLgAPe5YuF8','2026-10-29 10:41:00','2026-10-22 10:41:00'),(29,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzkyNzQyMDg0LCJleHAiOjE3OTMzNDY4ODR9.VwjmQR7FYy4omekGHQsGJfxf_IXBifX4rLyP8QxQOkk','2026-10-30 14:54:44','2026-10-23 14:54:44'),(30,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNzQyMTk3LCJleHAiOjE3OTMzNDY5OTd9.y4zSqxY7Se42_BYfuEYGWlZgxGP_qC0IvFQ72QQEblA','2026-10-30 14:56:37','2026-10-23 14:56:37'),(31,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNzQyODAyLCJleHAiOjE3OTMzNDc2MDJ9.vMWPJfGP1MJ6ZFtUM1N1JVCFmzLCI0lnkN0_Hf0F6yM','2026-10-30 15:06:42','2026-10-23 15:06:42'),(32,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkyNzQzNDM2LCJleHAiOjE3OTMzNDgyMzZ9.4iDFrUetRbVnaKv6gcrZwadJnQBVbnOEv7QIPFcL0Hs','2026-10-30 15:17:16','2026-10-23 15:17:16'),(33,7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiaWF0IjoxNzkzNDM4NjA3LCJleHAiOjE3OTQwNDM0MDd9.iqRg5KnLxFKClRTEib1ue4-RK-KaGv6UJNQJHi26Dxg','2026-11-07 16:23:27','2026-10-31 16:23:27'),(34,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDM4OTMyLCJleHAiOjE3OTQwNDM3MzJ9.NquhClNiLamfh46bUsLqAADPaJ5oUPEez0vBiVa6ZB0','2026-11-07 16:28:52','2026-10-31 16:28:52'),(35,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDM5MDE5LCJleHAiOjE3OTQwNDM4MTl9.GlPlGySfwY1SqWpRpI2bzjegpBU549SQobXIdIvLg2c','2026-11-07 16:30:19','2026-10-31 16:30:19'),(36,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDM5MjgzLCJleHAiOjE3OTQwNDQwODN9.tqeB1g0E0cNrlY0XnjpNTYgx9RkbrvlUApKbGgkDCFQ','2026-11-07 16:34:43','2026-10-31 16:34:43'),(37,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDM5NDEwLCJleHAiOjE3OTQwNDQyMTB9.LMDnUTzJuV7DDxG0_qy32ytgJakwtraQU07DBq-FQvA','2026-11-07 16:36:50','2026-10-31 16:36:50'),(38,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDM5NDg1LCJleHAiOjE3OTQwNDQyODV9.3rffO9F_iGciPwf99UnHcKHsars0106WpSF2rkqCgww','2026-11-07 16:38:05','2026-10-31 16:38:05'),(39,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzkzNDQwNjAzLCJleHAiOjE3OTQwNDU0MDN9.bCUyVyMAJ-aK5ZpHt00U8jLsqdfBrrwCUHCqOSzmoMA','2026-11-07 16:56:43','2026-10-31 16:56:43'),(40,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxMzcwLCJleHAiOjE3OTQwNDYxNzB9.8jW5TkU3DasLMQjzBmrv048oL61fWrfQr9nLE0rXu7Y','2026-11-07 17:09:30','2026-10-31 17:09:30'),(41,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxMzc0LCJleHAiOjE3OTQwNDYxNzR9.aHCLjvPDhVYvswB40UQu_cEeEuQNMyJfjEQ_umG9PQc','2026-11-07 17:09:34','2026-10-31 17:09:34'),(42,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxMzg0LCJleHAiOjE3OTQwNDYxODR9.TURd8gLYElyodfAqvg33Nb1AlpiFbtH5ZfJB3AuLpdQ','2026-11-07 17:09:44','2026-10-31 17:09:44'),(43,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxNDAyLCJleHAiOjE3OTQwNDYyMDJ9.3EGh5JIOSgkilz545dBePM4zgjpaRBkDsop5XzWw3Q0','2026-11-07 17:10:02','2026-10-31 17:10:02'),(44,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxNDA1LCJleHAiOjE3OTQwNDYyMDV9.ZjmQ0NMlSZGolytbgyNai3fGvJKPDL193-wKYF6PFes','2026-11-07 17:10:05','2026-10-31 17:10:05'),(45,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxNjE1LCJleHAiOjE3OTQwNDY0MTV9.pYl-iUvU9BSZUkrcwgO1ELmhOojMXCYU2SpjRuqBu44','2026-11-07 17:13:35','2026-10-31 17:13:35'),(46,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQxNjE5LCJleHAiOjE3OTQwNDY0MTl9.Lc3XbglhrUOh0dyrTMa8I3kTcmZhwJhCg-ByHrTl1lk','2026-11-07 17:13:39','2026-10-31 17:13:39'),(47,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQyMzE5LCJleHAiOjE3OTQwNDcxMTl9.u5VKSMjUPcZUw_XlRb1Ru06O3aBoH_CsaUYQ_LA9JAA','2026-11-07 17:25:19','2026-10-31 17:25:19'),(48,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQyODg5LCJleHAiOjE3OTQwNDc2ODl9.b3esscjR8yvXluXUTSCm29N10iBwr0Wyw8PTAICfmVM','2026-11-07 17:34:49','2026-10-31 17:34:49'),(49,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQyODkzLCJleHAiOjE3OTQwNDc2OTN9.lSeZAAk86jTjeU3-82SeHbMGDxwYZCZZIrLOdTUEN_E','2026-11-07 17:34:53','2026-10-31 17:34:53'),(50,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQyOTE1LCJleHAiOjE3OTQwNDc3MTV9.gTcM5rYm5CzqsOd8N0VQ1Zyjm_CbACaNFe_cd1Oi9dk','2026-11-07 17:35:15','2026-10-31 17:35:15'),(51,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQyOTE4LCJleHAiOjE3OTQwNDc3MTh9.jH_xjcQkfpZskN75QX0lfx-cvxgEV-ogkiyk5gmdIic','2026-11-07 17:35:18','2026-10-31 17:35:18'),(52,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQzNzI2LCJleHAiOjE3OTQwNDg1MjZ9.u5JHauW40L8E6D73R-JTsox2YRA8XXs6XBCtVdHxchQ','2026-11-07 17:48:46','2026-10-31 17:48:46'),(53,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQzNzMyLCJleHAiOjE3OTQwNDg1MzJ9.5D7vuebPAjDSdtkutJveBF2RJgENjuq49LcHOJfvcm0','2026-11-07 17:48:52','2026-10-31 17:48:52'),(54,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQzODkwLCJleHAiOjE3OTQwNDg2OTB9._hGHEBaa5aROOdqWYPz5IatLHlzwRnP9jyEMYEn3b28','2026-11-07 17:51:30','2026-10-31 17:51:30'),(55,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQ2MTc3LCJleHAiOjE3OTQwNTA5Nzd9.l-18pvWQO90AzNEF-lX6uCkZRH6SYp8LmO4SMIJTFas','2026-11-07 18:29:37','2026-10-31 18:29:37'),(56,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDQ2MjcxLCJleHAiOjE3OTQwNTEwNzF9.mwxQBp07xwwaADDvJev87B5Y8nl4NUaHaej_3Ak7xhY','2026-11-07 18:31:11','2026-10-31 18:31:11'),(57,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDYzMTQ0LCJleHAiOjE3OTQwNjc5NDR9.b97GICm8UcPCm9iCsZL1WQS-Kx-pzzWqZSV5u9toLPk','2026-11-07 23:12:24','2026-10-31 23:12:24'),(58,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDYzMTgzLCJleHAiOjE3OTQwNjc5ODN9.aFgYT5tRmSwa_IjeoMA1jmES1PTajYUdruAU-5nzGpI','2026-11-07 23:13:03','2026-10-31 23:13:03'),(59,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDYzMjI0LCJleHAiOjE3OTQwNjgwMjR9.a9kGdQcKrxaxWtEP30a8RIk85l1m6VnSt680E2j_JYM','2026-11-07 23:13:44','2026-10-31 23:13:44'),(60,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY2MDE5LCJleHAiOjE3OTQwNzA4MTl9.gd5WMrMoIZcGuJaa4V9uPUmMt2Agt_GyI1lTyKFzE2E','2026-11-08 00:00:19','2026-11-01 00:00:19'),(61,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY3MDE5LCJleHAiOjE3OTQwNzE4MTl9.8APa_IYhXWB1YRKZWptREJDEY4XuL74LgXDs6K0CxEM','2026-11-08 00:16:59','2026-11-01 00:16:59'),(62,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY3MDM4LCJleHAiOjE3OTQwNzE4Mzh9.Bm3lz5UjLV6zT0w6eGi2TyAF3_AgElcilas36_j91zE','2026-11-08 00:17:18','2026-11-01 00:17:18'),(63,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY3MDU1LCJleHAiOjE3OTQwNzE4NTV9.s5bEAKFAxyXjP_sKk2vuWVFTqOAH0-hq8682Nq7apL4','2026-11-08 00:17:35','2026-11-01 00:17:35'),(64,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY3MDY2LCJleHAiOjE3OTQwNzE4NjZ9.S6Uhf93GlWDEOhNv9IzlXcjcmWqPjUG2LQcAPycgdjY','2026-11-08 00:17:46','2026-11-01 00:17:46'),(65,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY3MDkxLCJleHAiOjE3OTQwNzE4OTF9.VrxjLADB85QFgXP_QqVtzCuENhHaNdbIapTe6ybIecI','2026-11-08 00:18:11','2026-11-01 00:18:11'),(66,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDY4NTgzLCJleHAiOjE3OTQwNzMzODN9.vZRhQCJskAnoMkh9q-Yj33ZtrZQOEQnAXY8GKwpOtxA','2026-11-08 00:43:03','2026-11-01 00:43:03'),(67,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNDcwODU0LCJleHAiOjE3OTQwNzU2NTR9.LNqT61sauroFaRdLcZANh1tYj7BWbO7U154A6eRvnvk','2026-11-08 01:20:54','2026-11-01 01:20:54'),(68,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA0OTczLCJleHAiOjE3OTQyMDk3NzN9.yBI-bweUAFzM16OvTcoeovY-u8mEy-73Px5K7aIhflU','2026-11-09 14:36:13','2026-11-02 14:36:13'),(69,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA1MDE2LCJleHAiOjE3OTQyMDk4MTZ9.Hz6rq8pjrgUNqU99rNMcLgdMPJxlFXLFtXSHb3aKYy8','2026-11-09 14:36:56','2026-11-02 14:36:56'),(70,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA1MDM1LCJleHAiOjE3OTQyMDk4MzV9.DO0rkVu89wgcYtqs15ZBxHfOmYnE7iMNq3iyc4AWq7g','2026-11-09 14:37:15','2026-11-02 14:37:15'),(71,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA1MDc4LCJleHAiOjE3OTQyMDk4Nzh9.OL5idi2VY1QR9LdLlMA4ibZiMFQrz1cIwy1QUraUqk0','2026-11-09 14:37:58','2026-11-02 14:37:59'),(72,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA1MTI5LCJleHAiOjE3OTQyMDk5Mjl9.q4VMonbLwcfzBJhFw1tyU7-Koj41CSCFPXjL5-VKCGc','2026-11-09 14:38:49','2026-11-02 14:38:49'),(73,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA1ODkxLCJleHAiOjE3OTQyMTA2OTF9.8jgs1fAXFghSLqe1-75YQ31XB5Jf8kHNc6yvsWedmBA','2026-11-09 14:51:31','2026-11-02 14:51:31'),(74,4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzkzNjA2Mjk1LCJleHAiOjE3OTQyMTEwOTV9.mEM5mRqu-4Y0AWCbsUEj5y7zrUBZpmOjaUIX5_NdZTk','2026-11-09 14:58:15','2026-11-02 14:58:15'),(75,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA3MDU0LCJleHAiOjE3OTQyMTE4NTR9.fhOSJaa-no1jAg0uZkAZjQAiDXhO2Youdscg0R3Gjcg','2026-11-09 15:10:54','2026-11-02 15:10:54'),(76,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNjA3MDY5LCJleHAiOjE3OTQyMTE4Njl9.FFzBDpIHUykGbIJigRNTA-i3SUAgZXCFPh1__wRFD-8','2026-11-09 15:11:09','2026-11-02 15:11:09'),(77,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzEzNzY0LCJleHAiOjE3OTQzMTg1NjR9.tHZ__qrrBzDQD_tz52Jwi0mEd3v5O6qMQSpGJM5DCaY','2026-11-10 20:49:24','2026-11-03 20:49:24'),(78,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE0NjE2LCJleHAiOjE3OTQzMTk0MTZ9.-QonrULEStUusgFKBf4lzu5PsbbqvBL4RiWW4ZHmA2A','2026-11-10 21:03:36','2026-11-03 21:03:36'),(79,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE1MTYyLCJleHAiOjE3OTQzMTk5NjJ9.vLzgOqONfPAZMrgZssPdxJCvGS23d5sJkYMzgZRAfqY','2026-11-10 21:12:42','2026-11-03 21:12:42'),(80,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE1MjkyLCJleHAiOjE3OTQzMjAwOTJ9.xPhcatmc0LJ-kwHIG2HzzDRowbM33tEbsLeLwaQIYkY','2026-11-10 21:14:52','2026-11-03 21:14:52'),(81,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE1NjA3LCJleHAiOjE3OTQzMjA0MDd9.A7744yxgae01ByEDoihfHAtIx7f3OFK8nUxZFsh8-qg','2026-11-10 21:20:07','2026-11-03 21:20:07'),(82,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE1NzUyLCJleHAiOjE3OTQzMjA1NTJ9.gPKVryqpDl6BE8byPZsD4LmJhokBNGJkFy8kzJ_NSUs','2026-11-10 21:22:32','2026-11-03 21:22:32'),(83,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE2NTQ0LCJleHAiOjE3OTQzMjEzNDR9.PkK1flCBXVXY7vgc8U-Pk2219BuCDoITgt2lGEF3fQQ','2026-11-10 21:35:44','2026-11-03 21:35:44'),(84,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE3MDM5LCJleHAiOjE3OTQzMjE4Mzl9.atP0FWX3HRNYyke_RKvmPaeCFb4nFR_u9Di8UhlpS9A','2026-11-10 21:43:59','2026-11-03 21:43:59'),(85,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzNzE4MTcyLCJleHAiOjE3OTQzMjI5NzJ9.BCCBLqiRn2b-hYQ0Ap-1hexYB5_A8nN1YQF8Xly7Vcc','2026-11-10 22:02:52','2026-11-03 22:02:52'),(86,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzOTM4OTg0LCJleHAiOjE3OTQ1NDM3ODR9.xp0lZIN0QkemyaKP8usn-WsRv2uUKZBCrtrWndyLFe0','2026-11-13 11:23:04','2026-11-06 11:23:04'),(87,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzOTUzMDYwLCJleHAiOjE3OTQ1NTc4NjB9.6uWsZgYi3OIxhp-OlX4XnDThEF19bHi_a5aqDnf93aQ','2026-11-13 15:17:40','2026-11-06 15:17:40'),(88,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzOTUzODc2LCJleHAiOjE3OTQ1NTg2NzZ9.r2DPTp1bfqLo6GXRH63wWMJvp4mA3IfZ97smt0SEoFk','2026-11-13 15:31:16','2026-11-06 15:31:16'),(89,6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzkzOTU0NzQ4LCJleHAiOjE3OTQ1NTk1NDh9.OSrKL8v9EKS4GLGGZ3yRUE5yvF0zluzzWS9JVNJXMqs','2026-11-13 15:45:48','2026-11-06 15:45:48');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'guest','Khach hang'),(2,'admin','Nhan vien quan tri'),(3,'owner','Chu khach san');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `capacity` int NOT NULL DEFAULT '2',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES (1,'Standard Updated','Phong tieu chuan da cap nhat',3,'2026-10-11 21:48:55','2026-10-13 17:46:46'),(2,'Deluxe','Phong cao cap',2,'2026-10-11 21:48:55','2026-10-11 21:48:55'),(3,'Suite','Phong hang sang',4,'2026-10-11 21:48:55','2026-10-11 21:48:55'),(6,'Deluxe Test1','Phong deluxe dung de kiem thu',2,'2026-10-19 15:59:23','2026-10-19 15:59:23');
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type_id` int NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `status` enum('available','occupied','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `image_public_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `room_type_id` (`room_type_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'TEST-901',1,700000.00,'available','Phong TEST-901 da cap nhat',NULL,'2026-10-11 21:48:55','2026-10-22 10:42:00',NULL),(2,'102',1,350000.00,'available','Phong Standard',NULL,'2026-10-11 21:48:55','2026-10-11 21:48:55',NULL),(3,'201',2,500000.00,'occupied','Phong Deluxe',NULL,'2026-10-11 21:48:55','2026-11-01 00:47:38',NULL),(4,'301',3,1200000.00,'available','Phong Suite',NULL,'2026-10-11 21:48:55','2026-10-11 21:48:55',NULL),(8,'405',1,650000.00,'occupied','Phong dang co khach thue',NULL,'2026-10-12 21:20:52','2026-10-12 21:20:52',NULL),(17,'507',1,3999971.00,'available','vip','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_MRcJWlCxHzMMykM1iH8McGsuDP2m549ziMGiyth_lw&s=10','2026-10-31 23:14:40','2026-10-31 23:29:31',NULL),(18,'503',3,4000000.00,'available','vip','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZzCxPBL7ndIC0yFsT0ozPt4qjI_FU6GqnXrOn0Dfx5g&s=10','2026-10-31 23:26:04','2026-10-31 23:26:04',NULL),(20,'303',1,500000.00,'available','Phòng Deluxe có ban công','https://res.cloudinary.com/ic8ohbae/image/upload/v1793953899/hotel-pms/rooms/i3x17vyfsdvf3injhzhc.jpg','2026-11-06 15:31:40','2026-11-06 15:31:40','hotel-pms/rooms/i3x17vyfsdvf3injhzhc'),(21,'605',1,500000.00,'available',NULL,NULL,'2026-11-06 15:47:31','2026-11-06 15:47:31',NULL),(22,'902',1,40000000.00,'available','vip','https://res.cloudinary.com/ic8ohbae/image/upload/v1793956117/hotel-pms/rooms/d3rgrg8bkfz8onyljfgf.jpg','2026-11-06 16:08:38','2026-11-06 16:08:38','hotel-pms/rooms/d3rgrg8bkfz8onyljfgf');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Breakfast','Bua sang',80000.00,1,'2026-10-11 21:48:55','2026-10-11 21:48:55'),(2,'Laundry','Dich vu giat ui',50000.00,1,'2026-10-11 21:48:55','2026-10-11 21:48:55'),(3,'Airport Transfer','Dua don san bay',200000.00,1,'2026-10-11 21:48:55','2026-10-11 21:48:55');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_logs`
--

DROP TABLE IF EXISTS `sync_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `channel_id` int NOT NULL,
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('success','failed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `external_booking_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sync_logs_channel` (`channel_id`),
  KEY `idx_sync_logs_created_at` (`created_at`),
  CONSTRAINT `fk_sync_logs_channel` FOREIGN KEY (`channel_id`) REFERENCES `ota_channels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_logs`
--

LOCK TABLES `sync_logs` WRITE;
/*!40000 ALTER TABLE `sync_logs` DISABLE KEYS */;
INSERT INTO `sync_logs` VALUES (1,1,'booking_received','failed','BOOKING-TEST-001','Không tìm thấy ánh xạ loại phòng OTA','2026-11-02 22:31:48'),(2,1,'booking_received','success','BOOKING-TEST-001','OTA Booking received successfully','2026-11-02 22:38:28');
/*!40000 ALTER TABLE `sync_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_id` int NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`,`password`,`full_name`,`email`,`phone`,`role_id`,`status`,`created_at`,`updated_at`) VALUES (1,'test123456','Khach Hang Test','test_customer@example.com','0900000001',1,1,'2026-10-13 00:26:21','2026-10-13 00:26:21'),(2,'$2b$10$NKCLFO2kF3LMjn5xZ/oVQeAAyGYRhal4PQlu/o60.fv.qWJrF3grG','Guest Demo','guest_demo@example.com','0901234567',1,1,'2026-10-16 23:01:39','2026-10-16 23:01:39'),(3,'$2b$10$anCAdcnDmYXn8z1gX9fyYuruwNoqqzp8O3esey1HORI.K10nUvhd6','Guest Demo','guest_demo2@example.com','0901234567',1,1,'2026-10-19 14:26:56','2026-10-19 14:26:56'),(4,'$2b$10$dLTSC8wYCyOKsW7Q04V48.497KACHYpDCuIt91ypNPIRF9VkdqVL6','Guest Demo','guest_demo3@example.com','0901234567',1,1,'2026-10-19 14:35:59','2026-10-19 14:35:59'),(6,'$2b$10$YicnPVUxvK5pP1HaM.GLe.bKtFaVCth3UmrQqgSzCktiIYVmjt5xi','Admin Test','admin_test@example.com','0900000002',2,1,'2026-10-19 15:25:04','2026-10-19 15:25:04'),(7,'$2b$10$/fjwrijK8kO1i/lnwMo.XONS.iBJX.ufn51s1Eovx4aLg1gpplsvC','Owner Test','owner_test@example.com','0900000003',3,1,'2026-10-19 15:50:37','2026-10-19 15:50:37'),(8,'$2b$10$bkqw9AXzAO893cRMs8bjcOQXq3X5LsSRyZ0ejh8wkjo4z/340gLbS','Guest Demo','guest_demo4@example.com','0901234567',1,1,'2026-10-19 15:52:40','2026-10-19 15:52:40'),(9,'$2b$10$oNEJ4E2hNriGA8crdjS4c.gHoXOlluEL9LDYhMul5zEcqfjBxqZK.','nguyen dang phuc','phucdangzai@gmail.com','0355765047',1,1,'2026-10-22 10:05:05','2026-10-22 10:05:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-07 15:57:34
