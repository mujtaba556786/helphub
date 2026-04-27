-- ============================================================
--  HelpHub Database Backup
--  Generated: 2026-04-27
--
--  HOW TO RESTORE ON A NEW MACHINE
--  --------------------------------
--  1. Install MySQL 8 (or MAMP which bundles MySQL 8)
--  2. Start MySQL and open a terminal
--  3. Create the database:
--       mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS servicelink_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--  4. Import this file:
--       mysql -u root -p servicelink_db < helphub_backup.sql
--  5. Update backend/.env:
--       DB_HOST=127.0.0.1
--       DB_PORT=3306   (3306 default, or 8889 if using MAMP)
--       DB_USER=root
--       DB_PASSWORD=yourpassword
--       DB_NAME=servicelink_db
--  6. Install and start backend:
--       cd backend && npm install && node server.js
-- ============================================================

-- MySQL dump 10.13  Distrib 8.0.44, for macos12.7 (arm64)
--
-- Host: 127.0.0.1    Database: servicelink_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `provider_id` varchar(50) NOT NULL,
  `service` varchar(100) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` varchar(20) DEFAULT NULL,
  `message` text,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_seen` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('B1774533325858','U1774471453671','p1','Gardening','2026-03-30','10:00 AM','Need garden help please','cancelled','2026-03-26 13:55:25',1),('B1774533802698','U1774471453671','U1774471453671','Gardening','2026-03-27','17:00','Driver wanted ','confirmed','2026-03-26 14:03:22',1),('B1774737976622','U1774471453671','p1','Gardening','2026-03-01','9:00','hi','cancelled','2026-03-28 22:46:16',1),('B1774772452108','U1774471453671','U1774471453671','Gardening','2026-04-01','17:00','Hi','declined','2026-03-29 08:20:52',1),('B1774860004241','U1774471453671','U1774471453671','Driver','2026-03-31','17:00','I need ur help ','confirmed','2026-03-30 08:40:04',1),('B1774873908921','U1774471453671','U1774471453671','Driver','2026-03-31','18:00','driver','confirmed','2026-03-30 12:31:48',1),('B1775332961247','U1774471453671','p2','Babysitting','2026-04-05','10.00','i would like to know details ','cancelled','2026-04-04 20:02:41',1),('B1776295006836','U1774471453671','U1775995635200','Transport',NULL,NULL,NULL,'cancelled','2026-04-15 23:16:46',1),('B1776977330547','test_customer','test_provider','Cleaning','2026-05-01','10:00',NULL,'confirmed','2026-04-23 20:48:50',1),('B1777155530346','U1774471453671','p1','Gardening','2026-04-19','21:00','hi0987+#######-.','cancelled','2026-04-25 22:18:50',1);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` varchar(50) NOT NULL,
  `participant_1` varchar(50) NOT NULL,
  `participant_2` varchar(50) NOT NULL,
  `last_message` text,
  `last_message_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_p1` (`participant_1`),
  KEY `idx_p2` (`participant_2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('CONV1775022353689','U1774471453671','p11','I\'m available','2026-04-03 10:03:29','2026-04-01 05:45:53'),('CONV1775025769708','U1774471453671','p1','Can we reschedule?','2026-04-01 07:11:29','2026-04-01 06:42:49'),('CONV1775047193378','U1774471453671','p2','hi','2026-04-04 20:03:07','2026-04-01 12:39:53'),('CONV1775333827589','U1774471453671','p8','Can we reschedule?','2026-04-08 22:03:42','2026-04-04 20:17:07'),('CONV1775543337715','U1774471453671','p4','hi','2026-04-08 22:03:34','2026-04-07 06:28:57'),('CONV1775775909425','U1774471453671','p5','Teşekkürler!','2026-04-09 23:05:13','2026-04-09 23:05:09'),('CONV1775999586985','U1774471453671','U1775995635200','I\'m available','2026-04-15 23:04:31','2026-04-12 13:13:06'),('CONV1776321503807','U1774471453671','p3','msg 10','2026-04-16 06:38:24','2026-04-16 06:38:23'),('CONV1776689893631','U1774471453671','p9',NULL,'2026-04-20 12:58:13','2026-04-20 12:58:13'),('CONV1776749997021','U1774471453671','p6',NULL,'2026-04-21 05:39:57','2026-04-21 05:39:57'),('CONV1777010197305','test123','test456',NULL,'2026-04-24 05:56:37','2026-04-24 05:56:37'),('CONV1777163518299','U1774471453671','test123',NULL,'2026-04-26 00:31:58','2026-04-26 00:31:58');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_messages`
--

DROP TABLE IF EXISTS `direct_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `direct_messages` (
  `id` varchar(50) NOT NULL,
  `conversation_id` varchar(50) NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_unread` (`conversation_id`,`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_messages`
--

LOCK TABLES `direct_messages` WRITE;
/*!40000 ALTER TABLE `direct_messages` DISABLE KEYS */;
INSERT INTO `direct_messages` VALUES ('DM1775022396062tlk3','CONV1775022353689','U1774471453671','Hi Yuki! Are you available for a gardening job this weekend?',0,'2026-04-01 05:46:36'),('DM17750231399413wu6','CONV1775022353689','U1774471453671','yes',0,'2026-04-01 05:58:59'),('DM1775026684195ui2i','CONV1775025769708','U1774471453671','I\'m available',0,'2026-04-01 06:58:04'),('DM1775026847388uqil','CONV1775025769708','U1774471453671','See you soon',0,'2026-04-01 07:00:47'),('DM17750268487059wcl','CONV1775025769708','U1774471453671','Thank you!',0,'2026-04-01 07:00:48'),('DM1775027489989h233','CONV1775025769708','U1774471453671','Can we reschedule?',0,'2026-04-01 07:11:29'),('DM1775209807391zvfp','CONV1775022353689','U1774471453671','I\'m available',0,'2026-04-03 09:50:07'),('DM177521060564899lc','CONV1775022353689','U1774471453671','I\'m available',0,'2026-04-03 10:03:25'),('DM1775210607353fcgm','CONV1775022353689','U1774471453671','Thank you!',0,'2026-04-03 10:03:27'),('DM1775210608426ssxf','CONV1775022353689','U1774471453671','See you soon',0,'2026-04-03 10:03:28'),('DM1775210609374eo95','CONV1775022353689','U1774471453671','I\'m available',0,'2026-04-03 10:03:29'),('DM1775332987645q6dm','CONV1775047193378','U1774471453671','hi',0,'2026-04-04 20:03:07'),('DM177568581458274mg','CONV1775543337715','U1774471453671','hi',0,'2026-04-08 22:03:34'),('DM1775685820492klyu','CONV1775333827589','U1774471453671','I\'m available',0,'2026-04-08 22:03:40'),('DM1775685822331gcis','CONV1775333827589','U1774471453671','Can we reschedule?',0,'2026-04-08 22:03:42'),('DM17757759117741hmv','CONV1775775909425','U1774471453671','Uygunum',0,'2026-04-09 23:05:11'),('DM1775775913104thyu','CONV1775775909425','U1774471453671','Teşekkürler!',0,'2026-04-09 23:05:13'),('DM1776294189823c3mj','CONV1775999586985','U1774471453671','Hi Alex! I need a ride from Berlin Mitte to Schönefeld airport tomorrow at 7am. Are you available?',0,'2026-04-15 23:03:09'),('DM1776294271590c977','CONV1775999586985','U1774471453671','I\'m available',0,'2026-04-15 23:04:31'),('DM1776321503838uw40','CONV1776321503807','U1774471453671','msg 1',0,'2026-04-16 06:38:23'),('DM1776321503875ukr7','CONV1776321503807','U1774471453671','msg 2',0,'2026-04-16 06:38:23'),('DM1776321503913a20q','CONV1776321503807','U1774471453671','msg 3',0,'2026-04-16 06:38:23'),('DM1776321503949kio4','CONV1776321503807','U1774471453671','msg 4',0,'2026-04-16 06:38:23'),('DM1776321503986arnj','CONV1776321503807','U1774471453671','msg 5',0,'2026-04-16 06:38:23'),('DM1776321504023d7fr','CONV1776321503807','U1774471453671','msg 6',0,'2026-04-16 06:38:24'),('DM17763215040592j8w','CONV1776321503807','U1774471453671','msg 7',0,'2026-04-16 06:38:24'),('DM1776321504096b0g1','CONV1776321503807','U1774471453671','msg 8',0,'2026-04-16 06:38:24'),('DM1776321504132r6y4','CONV1776321503807','U1774471453671','msg 9',0,'2026-04-16 06:38:24'),('DM1776321504169dxtj','CONV1776321503807','U1774471453671','msg 10',0,'2026-04-16 06:38:24');
/*!40000 ALTER TABLE `direct_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magic_link_tokens`
--

DROP TABLE IF EXISTS `magic_link_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `magic_link_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_ml_token_hash` (`token_hash`),
  KEY `idx_ml_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magic_link_tokens`
--

LOCK TABLES `magic_link_tokens` WRITE;
/*!40000 ALTER TABLE `magic_link_tokens` DISABLE KEYS */;
INSERT INTO `magic_link_tokens` VALUES (14,'4a4303229dd5cb5fb00894639116c2ae73a3f178857c3281cb2e18095a49d970','test@test.com','2026-04-25 11:21:23','2026-04-25 09:06:22'),(16,'7754885fe7f6b12cd8d717a6dab094488c2eabfbb48d30c10505ec5871320a7c','test@example.com','2026-04-25 11:45:50','2026-04-25 09:30:50'),(19,'8db599adf198d92e6217900d00b2ee706ddfef5e003ad940898d1dbba7c92237','demo@helphub.app','2026-04-27 07:50:33','2026-04-27 05:35:32');
/*!40000 ALTER TABLE `magic_link_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `booking_id` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_unread` (`user_id`,`is_read`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'p1','booking_request','New booking request from Demo User','Demo User wants to book Gardening on 2026-03-30 at 10:00 AM.','B1774533325858',0,'2026-03-26 13:55:25'),(2,'U1774471453671','booking_request','New booking request from Demo User','Demo User wants to book Gardening on 2026-03-27 at 17:00.','B1774533802698',1,'2026-03-26 14:03:22'),(3,'U1774471453671','booking_confirmed','Demo User confirmed your booking!','Your booking for Gardening has been confirmed.','B1774533802698',1,'2026-03-26 14:03:37'),(4,'p1','booking_request','New booking request from Demo User','Demo User wants to book Gardening on 2026-03-01 at 9:00.','B1774737976622',0,'2026-03-28 22:46:16'),(5,'U1774471453671','booking_request','New booking request from Demo User','Demo User wants to book Gardening on 2026-04-01 at 17:00.','B1774772452108',1,'2026-03-29 08:20:52'),(6,'U1774471453671','booking_declined','Demo User declined your booking','Your booking for Gardening was declined. Try another helper.','B1774772452108',1,'2026-03-30 05:16:30'),(7,'U1774471453671','booking_request','New booking request from Demo User','Demo User wants to book Driver on 2026-03-31 at 17:00.','B1774860004241',1,'2026-03-30 08:40:04'),(8,'U1774471453671','booking_confirmed','Demo User confirmed your booking!','Your booking for Driver has been confirmed.','B1774860004241',1,'2026-03-30 08:40:22'),(9,'U1774471453671','booking_request','New booking request from Demo User','Demo User wants to book Driver on 2026-03-31 at 18:00.','B1774873908921',1,'2026-03-30 12:31:48'),(10,'U1774471453671','booking_confirmed','Demo User confirmed your booking!','Your booking for Driver has been confirmed.','B1774873908921',1,'2026-03-30 12:31:57'),(11,'p11','direct_message','💬 Demo User','Hi Yuki! Are you available for a gardening job this weekend?',NULL,0,'2026-04-01 05:46:36'),(12,'p11','direct_message','💬 Demo User','yes',NULL,0,'2026-04-01 05:58:59'),(13,'p1','direct_message','💬 Demo User','I\'m available',NULL,0,'2026-04-01 06:58:04'),(14,'p1','direct_message','💬 Demo User','See you soon',NULL,0,'2026-04-01 07:00:47'),(15,'p1','direct_message','💬 Demo User','Thank you!',NULL,0,'2026-04-01 07:00:48'),(16,'p1','direct_message','💬 Demo User','Can we reschedule?',NULL,0,'2026-04-01 07:11:29'),(17,'p11','direct_message','💬 Demo User','I\'m available',NULL,0,'2026-04-03 09:50:07'),(18,'p11','direct_message','💬 Demo User','I\'m available',NULL,0,'2026-04-03 10:03:25'),(19,'p11','direct_message','💬 Demo User','Thank you!',NULL,0,'2026-04-03 10:03:27'),(20,'p11','direct_message','💬 Demo User','See you soon',NULL,0,'2026-04-03 10:03:28'),(21,'p11','direct_message','💬 Demo User','I\'m available',NULL,0,'2026-04-03 10:03:29'),(22,'p2','booking_request','New booking request from Demo User','Demo User wants to book Babysitting on 2026-04-05 at 10.00.','B1775332961247',0,'2026-04-04 20:02:41'),(23,'p2','direct_message','💬 Demo User','hi',NULL,0,'2026-04-04 20:03:07'),(24,'p4','direct_message','💬 Demo User','hi',NULL,0,'2026-04-08 22:03:34'),(25,'p8','direct_message','💬 Demo User','I\'m available',NULL,0,'2026-04-08 22:03:40'),(26,'p8','direct_message','💬 Demo User','Can we reschedule?',NULL,0,'2026-04-08 22:03:42'),(27,'p5','direct_message','💬 Demo User','Uygunum',NULL,0,'2026-04-09 23:05:11'),(28,'p5','direct_message','💬 Demo User','Teşekkürler!',NULL,0,'2026-04-09 23:05:13'),(29,'U1775995635200','direct_message','💬 Demo User','Hi Alex! I need a ride from Berlin Mitte to Schönefeld airport tomorrow at 7am. Are you available?',NULL,0,'2026-04-15 23:03:09'),(30,'U1775995635200','direct_message','💬 Demo User','I\'m available',NULL,0,'2026-04-15 23:04:31'),(31,'U1775995635200','booking_request','New booking request from Demo User','Demo User wants to book Transport.','B1776295006836',0,'2026-04-15 23:16:46'),(32,'p3','direct_message','💬 Demo User','msg 1',NULL,0,'2026-04-16 06:38:23'),(33,'p3','direct_message','💬 Demo User','msg 2',NULL,0,'2026-04-16 06:38:23'),(34,'p3','direct_message','💬 Demo User','msg 3',NULL,0,'2026-04-16 06:38:23'),(35,'p3','direct_message','💬 Demo User','msg 4',NULL,0,'2026-04-16 06:38:23'),(36,'p3','direct_message','💬 Demo User','msg 5',NULL,0,'2026-04-16 06:38:23'),(37,'p3','direct_message','💬 Demo User','msg 6',NULL,0,'2026-04-16 06:38:24'),(38,'p3','direct_message','💬 Demo User','msg 7',NULL,0,'2026-04-16 06:38:24'),(39,'p3','direct_message','💬 Demo User','msg 8',NULL,0,'2026-04-16 06:38:24'),(40,'p3','direct_message','💬 Demo User','msg 9',NULL,0,'2026-04-16 06:38:24'),(41,'p3','direct_message','💬 Demo User','msg 10',NULL,0,'2026-04-16 06:38:24'),(42,'p2','admin_warning','Account Warning','Your account has received a warning due to reported behavior. Please review our community guidelines.',NULL,0,'2026-04-16 06:38:24'),(43,'p1','task_application','📋 New applicant for \"Duplicate Task Test\"','Demo User wants to help with your task.',NULL,0,'2026-04-16 07:49:29'),(44,'p1','booking_cancelled','Booking cancelled by Demo User','The booking for Gardening has been cancelled.','B1774533325858',0,'2026-04-17 14:48:08'),(45,'p1','booking_cancelled','Booking cancelled by Demo User','The booking for Gardening has been cancelled.','B1774737976622',0,'2026-04-17 15:09:39'),(46,'U1775995635200','booking_cancelled','Booking cancelled by Demo User','The booking for Transport has been cancelled.','B1776295006836',0,'2026-04-20 10:30:54'),(47,'p2','booking_cancelled','Booking cancelled by Demo User','The booking for Babysitting has been cancelled.','B1775332961247',0,'2026-04-20 10:30:58'),(48,'test_provider','booking_request','New booking request from Someone','Someone wants to book Cleaning on 2026-05-01 at 10:00.','B1776977330547',0,'2026-04-23 20:48:50'),(49,'test_customer','booking_confirmed','null confirmed your booking!','Your booking for Cleaning has been confirmed.','B1776977330547',0,'2026-04-23 20:49:02'),(50,'test123','task_application','📋 New applicant for \"Test Task\"','Demo User wants to help with your task.',NULL,0,'2026-04-25 07:56:40'),(51,'p1','booking_request','New booking request from Demo User','Demo User wants to book Gardening on 2026-04-19 at 21:00.','B1777155530346',0,'2026-04-25 22:18:50'),(52,'p1','booking_cancelled','Booking cancelled by Demo User','The booking for Gardening has been cancelled.','B1777155530346',0,'2026-04-26 21:05:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `provider_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `reviewer_name` varchar(100) DEFAULT NULL,
  `stars` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,'p8','U1774471453671','Demo User',5,'very nice','2026-04-08 18:25:56','approved'),(2,'p2','U1774471453671','Demo User',5,'hi','2026-04-21 18:03:47','approved'),(3,'U1774471453671','U1774471453671','Demo User',5,'5 star','2026-03-26 12:54:18','approved'),(4,'p2','U1774471453671','Demo User',5,'hi','2026-04-21 18:03:47','approved'),(5,'U1774471453671','U1774471453671','Demo User',5,NULL,'2026-03-30 10:25:38','approved'),(6,'p1','U1774471453671','Demo User',5,NULL,'2026-04-08 22:11:11','approved'),(7,'p7','U1774471453671','Demo User',5,NULL,'2026-04-21 18:15:45','rejected'),(8,'U1775995635200','U1774471453671','Demo User',5,'Alex was absolutely punctual, friendly and professional. Arrived 5 min early, helped with luggage. Highly recommended for airport transfers!','2026-04-15 23:27:23','approved'),(9,'p1','u_test99','Tester',4,'Great work','2026-04-25 07:24:26','pending');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token_hash` (`token_hash`)
) ENGINE=InnoDB AUTO_INCREMENT=255 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,'U1774505047067','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUwNTA0NzA2NyIsImlhdCI6MTc3NDUwNTA0NywiZXhwIjoxNzc3MDk3MDQ3fQ.C2tEaDMqMihke-nDlHKYOy2N0PKO5HhJ3xPkosTrYfw','2026-04-25 08:04:07','2026-03-26 06:04:07'),(2,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNTE3OSwiZXhwIjoxNzc3MDk3MTc5fQ.B9Z_AzcOC61JiDsV8J7NwGQKz0iMGDKow-SsTF06bUI','2026-04-25 08:06:20','2026-03-26 06:06:19'),(3,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNTU3NywiZXhwIjoxNzc3MDk3NTc3fQ.ur4ZJTprAQSM-Sb1VqG8TRnrWe4MtP8_VAYdSLcKMx0','2026-04-25 08:12:58','2026-03-26 06:12:57'),(4,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNjYwOSwiZXhwIjoxNzc3MDk4NjA5fQ.fO-4GgDwjAtv2KmCegvqTRne2xkgXYgl_XzvOZz8ii0','2026-04-25 08:30:09','2026-03-26 06:30:09'),(5,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNzIwMiwiZXhwIjoxNzc3MDk5MjAyfQ.ctiFg61NwBMwzLHV3N4olPNkKOoaF-9TXjJBo3B7CRM','2026-04-25 08:40:02','2026-03-26 06:40:02'),(6,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNzIwNSwiZXhwIjoxNzc3MDk5MjA1fQ.ZXUXQpfRqvY4mTS0ODAkfHTk3WehmtNuf3yERSkdckI','2026-04-25 08:40:06','2026-03-26 06:40:05'),(7,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNzI0OCwiZXhwIjoxNzc3MDk5MjQ4fQ.9EXcZDyBQVAdL1lcYoI20KeQ3oyJMaQ3WOx43UaCmBE','2026-04-25 08:40:48','2026-03-26 06:40:48'),(8,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNzMxMCwiZXhwIjoxNzc3MDk5MzEwfQ.y23naFFIApUo2EAgmmnys5FeFgQ2coGHqHlNdcnsZvg','2026-04-25 08:41:50','2026-03-26 06:41:50'),(9,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwNzM4MSwiZXhwIjoxNzc3MDk5MzgxfQ.wHt2uaUIvqUnZo51lGBi5SCA8AvYGlEUK-YlBfLuP1E','2026-04-25 08:43:02','2026-03-26 06:43:01'),(10,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUwOTI3NCwiZXhwIjoxNzc3MTAxMjc0fQ.vEAuuAFo1h2mVK4DSv3wT-VNV04awpB9DjZ4mvsrwUw','2026-04-25 09:14:34','2026-03-26 07:14:34'),(11,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxMDE5MiwiZXhwIjoxNzc3MTAyMTkyfQ.Qaz-onusBn6NOuvAJZwLSE8zHbihFvVOuYnZqIx4lmQ','2026-04-25 09:29:52','2026-03-26 07:29:52'),(12,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxMDIwMywiZXhwIjoxNzc3MTAyMjAzfQ.gEKK0eijixW0Dj9TZgvqBJ0JoEa0g988L-etZWH1GGU','2026-04-25 09:30:04','2026-03-26 07:30:03'),(13,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxMDUxNSwiZXhwIjoxNzc3MTAyNTE1fQ.beBON8g2pRLZ_l4NcYEBxpmWWvXEivZY7BEldfQTdN4','2026-04-25 09:35:15','2026-03-26 07:35:15'),(14,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxMDk5NiwiZXhwIjoxNzc3MTAyOTk2fQ.Of1I8j5kwGCa4TfQJqFLa7tUTfdvjHhfD4LKQAyPAsE','2026-04-25 09:43:17','2026-03-26 07:43:16'),(15,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxMTc5MywiZXhwIjoxNzc3MTAzNzkzfQ.d6QSvedQeCQsrFgyk7skt6jUlCkd4Efsg1aSDibNjzg','2026-04-25 09:56:33','2026-03-26 07:56:33'),(16,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxMTg1MCwiZXhwIjoxNzc3MTAzODUwfQ.3PlkrwXbsnztCFNKMPfs4FUm2lkuJI9mfF8VYoqpVL4','2026-04-25 09:57:31','2026-03-26 07:57:30'),(17,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxNDAxMCwiZXhwIjoxNzc3MTA2MDEwfQ.iuVATWV4VGWszSUTXiw9SWGgJHBe7iyY2Q2caKcgTKk','2026-04-25 10:33:30','2026-03-26 08:33:30'),(18,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxNDExMSwiZXhwIjoxNzc3MTA2MTExfQ.gm-nw1GgyTVqJk4aZhor2jUHEZKhXcKZ6C_hz_LVBik','2026-04-25 10:35:12','2026-03-26 08:35:11'),(19,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNDE0MiwiZXhwIjoxNzc3MTA2MTQyfQ.RWexJ1gPvxHxJ2BVjaCFzFt-IWGTLAMHeZq4A4SlQj0','2026-04-25 10:35:42','2026-03-26 08:35:42'),(20,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNDU0MCwiZXhwIjoxNzc3MTA2NTQwfQ.MAE6htDLwdxVoYjFcO0P_P-6vY79YKnxYzfC8hGmypo','2026-04-25 10:42:20','2026-03-26 08:42:20'),(21,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNTI5NywiZXhwIjoxNzc3MTA3Mjk3fQ.0F3BqZ40uRadjhin0ui9DgiBL4LnlngYgO1a2HLpLPQ','2026-04-25 10:54:58','2026-03-26 08:54:57'),(22,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNTg5MCwiZXhwIjoxNzc3MTA3ODkwfQ.TxM5Oa4lFLUUQbc7WXeJP6gTDdjNvsB0QtmNhVE0AIk','2026-04-25 11:04:50','2026-03-26 09:04:50'),(23,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNjA5MCwiZXhwIjoxNzc3MTA4MDkwfQ.akctQNWtPKyE30ZwZhii-ikAsVO9OG-Yyjdc5JZ0emA','2026-04-25 11:08:10','2026-03-26 09:08:10'),(24,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNjI4NCwiZXhwIjoxNzc3MTA4Mjg0fQ.kFjwdTOT4gbM2FEsglOJn6LfUpP7yN9EJCNm7MSv9c0','2026-04-25 11:11:24','2026-03-26 09:11:24'),(25,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNjM2MSwiZXhwIjoxNzc3MTA4MzYxfQ.haifq2jDIaUufCh9ZNM-pyyrcFk0aG_d52qUeKnffMU','2026-04-25 11:12:41','2026-03-26 09:12:41'),(26,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxNjYwOCwiZXhwIjoxNzc3MTA4NjA4fQ.W1mqJ0_yXMz-VV6398lVQLAgVCE4iz19XGIC08YIRkk','2026-04-25 11:16:49','2026-03-26 09:16:48'),(27,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxNjcxNiwiZXhwIjoxNzc3MTA4NzE2fQ.npnXCo_yGbwe7WBbBHH_fxIdoTRiYAsOg2_7p4SPzCY','2026-04-25 11:18:36','2026-03-26 09:18:36'),(28,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxNjc4MCwiZXhwIjoxNzc3MTA4NzgwfQ.WTjdfmKa-pdMVJvkT5lV3ulwbXcXQGj-IT7rZCRB7vo','2026-04-25 11:19:40','2026-03-26 09:19:40'),(29,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxNzk4NywiZXhwIjoxNzc3MTA5OTg3fQ.vF3_FValhc5FTIi2DczLv9dNgufTrkkkYoQO4R8ouEQ','2026-04-25 11:39:48','2026-03-26 09:39:47'),(30,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxODEwNCwiZXhwIjoxNzc3MTEwMTA0fQ.ZBzmgeqV2nJjpkXusDxUCXcap4lVkwsGI7G_3AWDw8g','2026-04-25 11:41:45','2026-03-26 09:41:44'),(31,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxODEwNCwiZXhwIjoxNzc3MTEwMTA0fQ.ZBzmgeqV2nJjpkXusDxUCXcap4lVkwsGI7G_3AWDw8g','2026-04-25 11:41:45','2026-03-26 09:41:44'),(32,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxODEwNCwiZXhwIjoxNzc3MTEwMTA0fQ.ZBzmgeqV2nJjpkXusDxUCXcap4lVkwsGI7G_3AWDw8g','2026-04-25 11:41:45','2026-03-26 09:41:44'),(33,'U1774514142307','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDUxNDE0MjMwNyIsImlhdCI6MTc3NDUxODUxNSwiZXhwIjoxNzc3MTEwNTE1fQ.2ILiebCslNF2TTul5vCZAD1oGlK8RKt31K9zjf5bjpk','2026-04-25 11:48:36','2026-03-26 09:48:35'),(34,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxODkyNywiZXhwIjoxNzc3MTEwOTI3fQ.baEvnS1X-9-VF1TXGra6oaUevC5S-1BQLOz48VAxsic','2026-04-25 11:55:27','2026-03-26 09:55:27'),(35,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxOTA1MSwiZXhwIjoxNzc3MTExMDUxfQ.D1G6Z0Wu0WgvD1UjlDbYHRfd-m_Vz35fxWy-8AI_mEk','2026-04-25 11:57:31','2026-03-26 09:57:31'),(36,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxOTMxNywiZXhwIjoxNzc3MTExMzE3fQ.HdlbCCksbxisIHlSkShbcWR4WJtGdkDFP0xrm-yi3jM','2026-04-25 12:01:57','2026-03-26 10:01:57'),(37,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxOTU5OSwiZXhwIjoxNzc3MTExNTk5fQ.592WZIkQbuWEMj3U5IfJ9oObHNQeaFy1r6eD1fos-Z8','2026-04-25 12:06:39','2026-03-26 10:06:39'),(38,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUxOTgxNywiZXhwIjoxNzc3MTExODE3fQ.klduuuqThi5nnu6RyPry3YjZ1XpwG8fPeSFfG9ann-U','2026-04-25 12:10:18','2026-03-26 10:10:17'),(39,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyMDIyOSwiZXhwIjoxNzc3MTEyMjI5fQ.AYITnf8sP18K4PgODF73z65gVlywOG2F0AXH2YoOyLA','2026-04-25 12:17:09','2026-03-26 10:17:09'),(40,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyMDk5NiwiZXhwIjoxNzc3MTEyOTk2fQ.2sEr0qP9a85lPXvMfl3_yQZXDNPB6uZRrdNIGhnyjRM','2026-04-25 12:29:56','2026-03-26 10:29:56'),(41,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyMjA3MCwiZXhwIjoxNzc3MTE0MDcwfQ.o9IDZyU_kmCaIdJz3bq_3ApiboRZ1UkQs8gNlXQaluM','2026-04-25 12:47:51','2026-03-26 10:47:50'),(42,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyMjE0MCwiZXhwIjoxNzc3MTE0MTQwfQ.TjE2zhG-lw2u2usjqa4HbtVebnCBMQIz3hJttTo8hN8','2026-04-25 12:49:00','2026-03-26 10:49:00'),(43,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyMjI5NiwiZXhwIjoxNzc3MTE0Mjk2fQ.QoAheEIq0-mDyqFoZ17yV3LyjgVx1ukTQCiYFVL0Zgg','2026-04-25 12:51:37','2026-03-26 10:51:36'),(44,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyNTMzNSwiZXhwIjoxNzc3MTE3MzM1fQ.en1RAtnjLIsKFGYeRVepRdIMseAlkUwU2Nuaq6SLuXQ','2026-04-25 13:42:15','2026-03-26 11:42:15'),(45,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyNzEzMCwiZXhwIjoxNzc3MTE5MTMwfQ.K-95STowMA3IOKzyAHD3inv2XMpcGJ2qDbgIcEQ9Tng','2026-04-25 14:12:11','2026-03-26 12:12:10'),(46,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyNzE1OSwiZXhwIjoxNzc3MTE5MTU5fQ.w94wLnrJZJ43ukOjZPD-4qMkZssVfOmRdtYj63UMLTU','2026-04-25 14:12:40','2026-03-26 12:12:39'),(47,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyNzMxNiwiZXhwIjoxNzc3MTE5MzE2fQ.5kkHpJ7pTqjn3bZhIbHZ1x2hXeXUeH73K_FlEuiOSD8','2026-04-25 14:15:17','2026-03-26 12:15:16'),(48,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyNzUwNiwiZXhwIjoxNzc3MTE5NTA2fQ.BI01O-L-oJkZm2oBTJTkPo4oP7mz64SWbFSWyxboRrA','2026-04-25 14:18:26','2026-03-26 12:18:26'),(49,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyODE5NCwiZXhwIjoxNzc3MTIwMTk0fQ.Qhm2xScmd7o0Zf___tfkQQ-3yhCjkrqO1dXjcwEOYP0','2026-04-25 14:29:54','2026-03-26 12:29:54'),(50,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyODMxMywiZXhwIjoxNzc3MTIwMzEzfQ.EV6paaYKJbiRPEmFFtVdRw890DW5S22mwUbL-7Afqbo','2026-04-25 14:31:54','2026-03-26 12:31:53'),(51,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUyOTQ4MywiZXhwIjoxNzc3MTIxNDgzfQ.0sOpUXcI5wmpyyu4IrzEy4sXsUkHBb-T6PQHxPtGLuc','2026-04-25 14:51:23','2026-03-26 12:51:23'),(52,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDUzMzY4OCwiZXhwIjoxNzc3MTI1Njg4fQ.qf42r9DbZLoEZliM5wxMbrFr-muHrbyqrdwmxaVVsSA','2026-04-25 16:01:28','2026-03-26 14:01:28'),(53,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0MTQyOSwiZXhwIjoxNzc3MTMzNDI5fQ.0Hk_A4cRtpbEpQQa3Vx8xCOZ-5TSbUERYLOnFuCmO-Y','2026-04-25 18:10:30','2026-03-26 16:10:29'),(54,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0Mjc4NywiZXhwIjoxNzc3MTM0Nzg3fQ.yB5dD7aQz2evpVtABqU-w6jOWXrs_RA-THvycU0EChs','2026-04-25 18:33:08','2026-03-26 16:33:07'),(55,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0NTI4NCwiZXhwIjoxNzc3MTM3Mjg0fQ.663T5qHN-MxS5rROrufVjg6D5ATLVbnydMW8JLN_rMw','2026-04-25 19:14:44','2026-03-26 17:14:44'),(56,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0NTI4NywiZXhwIjoxNzc3MTM3Mjg3fQ.Jm9W1TMjQxi5Lh2CZ_8GqQQetpmeNDt-A63d9pqetEI','2026-04-25 19:14:48','2026-03-26 17:14:47'),(57,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0NTMxNiwiZXhwIjoxNzc3MTM3MzE2fQ.EAaGHhAn5M1bfDdx1wq94rykpuaVSxigY71A5yn7eek','2026-04-25 19:15:16','2026-03-26 17:15:16'),(58,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0NjQ4MywiZXhwIjoxNzc3MTM4NDgzfQ.iTxQJLI4IsWBFyFcupSK7nVKT3T637uCRD8exJQ2Igw','2026-04-25 19:34:43','2026-03-26 17:34:43'),(59,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU0NzAzOCwiZXhwIjoxNzc3MTM5MDM4fQ.KUuRcnfMG8UqQ9f9AOiYHlSZWYAatzDCQKSnd8zUQbk','2026-04-25 19:43:59','2026-03-26 17:43:58'),(60,'U1774548300340','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDU0ODMwMDM0MCIsImlhdCI6MTc3NDU0ODMwMCwiZXhwIjoxNzc3MTQwMzAwfQ.uh1uzmgH8NC6FdsOlLH4zS0VqrPixfFoyLMTAJ_dRaA','2026-04-25 20:05:00','2026-03-26 18:05:00'),(61,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU1MzQ4MiwiZXhwIjoxNzc3MTQ1NDgyfQ.PT4USLun1t7tw4e89Grf2CX3GR5XYamos8X_oE2tSto','2026-04-25 21:31:22','2026-03-26 19:31:22'),(62,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU1NDI5OSwiZXhwIjoxNzc3MTQ2Mjk5fQ.Y7tbgQZQ9btL5vFAexs-pwsBk-l6OwDczc_xudGlbOE','2026-04-25 21:45:00','2026-03-26 19:44:59'),(63,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU2MDM1OCwiZXhwIjoxNzc3MTUyMzU4fQ.QaP6-IQi7GVM5VB1fQZQHVvjBzuylAIFMwOWJL6QfzE','2026-04-25 23:25:59','2026-03-26 21:25:58'),(64,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDU2MTgyMCwiZXhwIjoxNzc3MTUzODIwfQ.cJTpPp8L10SarpBOXwjVhwLIpSYGV83BVANlxVMcrn0','2026-04-25 23:50:20','2026-03-26 21:50:20'),(65,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDczNzkyNywiZXhwIjoxNzc3MzI5OTI3fQ.MNHjeSLCBc5orhe0bMlLHLiEvW3pXsT99nRndl1C_QA','2026-04-28 00:45:28','2026-03-28 22:45:27'),(66,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc2OTE3OSwiZXhwIjoxNzc3MzYxMTc5fQ.CKV1SuwvzK-bwloP48C6TqRnQ_Tlg0JE5w9gb_AE2nc','2026-04-28 09:26:20','2026-03-29 07:26:19'),(67,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc2OTYwNSwiZXhwIjoxNzc3MzYxNjA1fQ.xWiRwF3n_uFh2bbq43nF2lfHYv_FpdrEi3zgpngxLpA','2026-04-28 09:33:25','2026-03-29 07:33:25'),(68,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc2OTY3OSwiZXhwIjoxNzc3MzYxNjc5fQ.2apA51ER6vjxz-r9GySnZ94L0OkSu_AZE7o6NgLhYOk','2026-04-28 09:34:39','2026-03-29 07:34:39'),(69,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MDIyNSwiZXhwIjoxNzc3MzYyMjI1fQ.EakE4LCT-BAWvyW3EKxTnZw51nAr3bvh8UtOcbsf0ks','2026-04-28 09:43:45','2026-03-29 07:43:45'),(70,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MDU5NiwiZXhwIjoxNzc3MzYyNTk2fQ.p9Z6I_kKkKrTrcTb7jdLFHV19ffg-AuWmdvRtyvVt_Y','2026-04-28 09:49:56','2026-03-29 07:49:56'),(71,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MDczNiwiZXhwIjoxNzc3MzYyNzM2fQ.WinEgDKuSTW5Q9drUaeBqvLhSk5vFwFsSKJg5ztCXgo','2026-04-28 09:52:16','2026-03-29 07:52:16'),(72,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MDkzMCwiZXhwIjoxNzc3MzYyOTMwfQ.oeSIbCG0CxvVtzzs7S3r3-NGT0-NW2qSECTUhDGVzfU','2026-04-28 09:55:31','2026-03-29 07:55:30'),(73,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MTEzNSwiZXhwIjoxNzc3MzYzMTM1fQ.S3D3NFrunAEBLpEfCVburq9wUBLbv9jbDBRFLqmhZEo','2026-04-28 09:58:56','2026-03-29 07:58:55'),(74,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MjM3MSwiZXhwIjoxNzc3MzY0MzcxfQ.J28-ezn1UUxNSyrVTa76wpLnp0xEqLV0CbN9VXuP6yQ','2026-04-28 10:19:32','2026-03-29 08:19:31'),(75,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MjgyNywiZXhwIjoxNzc3MzY0ODI3fQ.WcNyG084VjOWl91yRIsBvzTz5BW-G-6LVRpkHtg9TUc','2026-04-28 10:27:08','2026-03-29 08:27:07'),(76,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3Mjg4OSwiZXhwIjoxNzc3MzY0ODg5fQ.MKuiqKhVM2vjF_SaCTtswn6SXhZUGh8D1_jGwP4-o44','2026-04-28 10:28:09','2026-03-29 08:28:09'),(77,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3MzI2MywiZXhwIjoxNzc3MzY1MjYzfQ.adDDyaGjO3iBqNCVDyYlhah-C5MRmhho7-a6njh74ic','2026-04-28 10:34:23','2026-03-29 08:34:23'),(78,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3NjQ4MSwiZXhwIjoxNzc3MzY4NDgxfQ.an649CZwmlLrvgbNSGuy1gV4eVkfb0_owtE9hJlgGBQ','2026-04-28 11:28:02','2026-03-29 09:28:01'),(79,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3ODA2MiwiZXhwIjoxNzc3MzcwMDYyfQ.RiUgc2jDz-hWyPGtxwJR-aspeQxXGE17alD70nNYrNk','2026-04-28 11:54:22','2026-03-29 09:54:22'),(80,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc3ODYyMywiZXhwIjoxNzc3MzcwNjIzfQ.OlKrnNdozesn0IbQnuFxH7GiWHqZMFl-sedC4pERbZQ','2026-04-28 12:03:44','2026-03-29 10:03:43'),(81,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4MTcwNywiZXhwIjoxNzc3MzczNzA3fQ.q1WZL1YLlfZXh0Z5Nc0mbwBnmjXGYA_ry0ppdCzWOi4','2026-04-28 12:55:08','2026-03-29 10:55:07'),(82,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4MzM0OCwiZXhwIjoxNzc3Mzc1MzQ4fQ.fy_CHJTb8UhJiPFau2_Q32Kx-1p9TleuakaPomznBY4','2026-04-28 13:22:29','2026-03-29 11:22:28'),(83,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4NDA3MiwiZXhwIjoxNzc3Mzc2MDcyfQ.z3qkZHT1owJj1fIyRA9qGugG6GFbXsMoIyMff4jMbhw','2026-04-28 13:34:32','2026-03-29 11:34:32'),(84,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4NDA4NCwiZXhwIjoxNzc3Mzc2MDg0fQ.XAUSIhbKV6VzX0TyPDRiCHEkW85jXkOhuBZn0m2PzpU','2026-04-28 13:34:44','2026-03-29 11:34:44'),(85,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4NTIxMywiZXhwIjoxNzc3Mzc3MjEzfQ.7CRMd5VnJ1gqy1oKW3TZ7ZyoCn6GPu9GURK8MKrEyY4','2026-04-28 13:53:34','2026-03-29 11:53:33'),(86,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4ODIzOSwiZXhwIjoxNzc3MzgwMjM5fQ.0PWdsGm_HinLaKxkEAqFbMbDCORcuz2vVvTrzqqZE8I','2026-04-28 14:44:00','2026-03-29 12:43:59'),(87,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4OTg0OSwiZXhwIjoxNzc3MzgxODQ5fQ.sy-Lfvw7qCBosjzv1ZAuY6Nakw6j0zRPv2IxXtulwtU','2026-04-28 15:10:49','2026-03-29 13:10:49'),(88,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc4OTg2NCwiZXhwIjoxNzc3MzgxODY0fQ.PrUe7X4QtfxevR5sl3C4ThTLNO9BsqlIskO5SC9nkpY','2026-04-28 15:11:04','2026-03-29 13:11:04'),(89,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc5MDA4NSwiZXhwIjoxNzc3MzgyMDg1fQ.sVN0KH8Kerulb5QhOe-BjHMm4zsUzD3sMIytaCauQhg','2026-04-28 15:14:45','2026-03-29 13:14:45'),(90,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc5MDA5OCwiZXhwIjoxNzc3MzgyMDk4fQ.jD2uyL5YTDnh2tQkOK7fLAEJqlbxb-m-SIlltw-eoDk','2026-04-28 15:14:58','2026-03-29 13:14:58'),(91,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc5MDIyNywiZXhwIjoxNzc3MzgyMjI3fQ.fvGMsy9sYfwk19h98ZX8iiatnsDrhOgTISo0FbTpcQg','2026-04-28 15:17:08','2026-03-29 13:17:07'),(92,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDc5MTA0OSwiZXhwIjoxNzc3MzgzMDQ5fQ.oHc8L_UXr_Hlro0PbsdTSw851NWTFhaj5ClCsIKXR80','2026-04-28 15:30:49','2026-03-29 13:30:49'),(93,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg0NjU1OCwiZXhwIjoxNzc3NDM4NTU4fQ.BImv8ytpWqqhX4oh84VJ3J3Tb7-3wZBbNRTxasOM_9s','2026-04-29 06:55:59','2026-03-30 04:55:58'),(94,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg0NjU2MiwiZXhwIjoxNzc3NDM4NTYyfQ.z30OlHjracvNzS9ifz0Mey4pPS2vPA5FX2GCJLXrVXA','2026-04-29 06:56:02','2026-03-30 04:56:02'),(95,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg0NjczNywiZXhwIjoxNzc3NDM4NzM3fQ.SBq9zSHVIVciYr2CiwQOeoBLeav8a-iIFY6z9I-QgWk','2026-04-29 06:58:57','2026-03-30 04:58:57'),(96,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg0Nzc1OSwiZXhwIjoxNzc3NDM5NzU5fQ.CuO1bOClUHF3UZXY1RZwwN814-pv5o-b2WDhZJeWly0','2026-04-29 07:16:00','2026-03-30 05:15:59'),(97,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg0ODUwMCwiZXhwIjoxNzc3NDQwNTAwfQ.WeP0nxN3w76tswNW3lDHDn3p2vDlMYNPiDWLjjBQ488','2026-04-29 07:28:21','2026-03-30 05:28:20'),(98,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg0ODgwMywiZXhwIjoxNzc3NDQwODAzfQ.9kaM4OFtULJ9VZVeOwPK_jiusdEE7xkUjyJEvkxt0qU','2026-04-29 07:33:24','2026-03-30 05:33:23'),(99,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1MDcxNiwiZXhwIjoxNzc3NDQyNzE2fQ.Vdt5SkqUI2s_B26ds1ChamCxMmkphcNzxexx6grq4KA','2026-04-29 08:05:16','2026-03-30 06:05:16'),(100,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1MTk5OSwiZXhwIjoxNzc3NDQzOTk5fQ.4aoQzGAR2DWmlFiTq1hg9qFAZaj6XYnnHsnmprVVmag','2026-04-29 08:26:39','2026-03-30 06:26:39'),(101,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1Mjc5NywiZXhwIjoxNzc3NDQ0Nzk3fQ.pSAPRwS88TtB7LaMTgGVkpc6hB19ONQVwzo7HAa8IN4','2026-04-29 08:39:57','2026-03-30 06:39:57'),(102,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1NDU5NywiZXhwIjoxNzc3NDQ2NTk3fQ.jjHizN2MJn2B8YFP6Ea0V09iiBJFkO1K3pTrJc0cWk0','2026-04-29 09:09:58','2026-03-30 07:09:57'),(103,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1NDgyOSwiZXhwIjoxNzc3NDQ2ODI5fQ.5PVR7ulnkj4JEZ_SQDmGBcFEwecM56Rx9fFt2bRAWWg','2026-04-29 09:13:50','2026-03-30 07:13:49'),(104,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1NTE0MCwiZXhwIjoxNzc3NDQ3MTQwfQ.mkcbO4sM-DMk6qK0bcQNJStg6zQC1wro27ejnWlCXiQ','2026-04-29 09:19:00','2026-03-30 07:19:00'),(105,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1ODgzNCwiZXhwIjoxNzc3NDUwODM0fQ.lp3l90OqSJMZXkP9OQAEfUpu0pngJCn9XMibMDApnug','2026-04-29 10:20:35','2026-03-30 08:20:34'),(106,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg1OTE0NCwiZXhwIjoxNzc3NDUxMTQ0fQ.c8pAsYr1dzlVQDcJ1G8SNGanZtH0HlVHTgKySuTDCaM','2026-04-29 10:25:45','2026-03-30 08:25:44'),(107,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg2Mjc4NiwiZXhwIjoxNzc3NDU0Nzg2fQ.7nmvhmsqTPtmizVXda1jML8QT-meZa_ruFDiyDg4b7o','2026-04-29 11:26:27','2026-03-30 09:26:26'),(108,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg2Mjg3NCwiZXhwIjoxNzc3NDU0ODc0fQ.qGtXfzE9H6xUNTDIIMANcgGnQyGyaHK2AQccxJF7SVk','2026-04-29 11:27:55','2026-03-30 09:27:54'),(109,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg2NDI3OCwiZXhwIjoxNzc3NDU2Mjc4fQ.R6KzV-BTryy6pNKJBiPusJ1jbelhzSnFhVEiXCmQXdo','2026-04-29 11:51:18','2026-03-30 09:51:18'),(110,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg2NTQ0MCwiZXhwIjoxNzc3NDU3NDQwfQ.lJ_Z4AVdv3yZV6jwElAmt3nSpF_2HtsUsswekbbI3Wo','2026-04-29 12:10:40','2026-03-30 10:10:40'),(111,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDg3Mzg0MiwiZXhwIjoxNzc3NDY1ODQyfQ.6l_mBvlQn_twSiUNQLTRO0-3go_AOMj6J9CDk9uY4cQ','2026-04-29 14:30:42','2026-03-30 12:30:42'),(112,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDkxMDYwMiwiZXhwIjoxNzc3NTAyNjAyfQ.eQqqDxnIY6PSsLQfOCzWHoIbNZmdCw75nC7beXMkp84','2026-04-30 00:43:23','2026-03-30 22:43:22'),(113,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NDkxMjA3MiwiZXhwIjoxNzc3NTA0MDcyfQ.fYsvXdSCikpCbeEWJbdWx_7N0sZeCgz3lOFMx8Asi8o','2026-04-30 01:07:53','2026-03-30 23:07:52'),(114,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAyMTczMywiZXhwIjoxNzc3NjEzNzMzfQ.J5t2a_X2Xo2I9BtPtreUeXHYZ3ILX6WY91CEy3QNSA8','2026-05-01 07:35:33','2026-04-01 05:35:33'),(115,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAyMTczOSwiZXhwIjoxNzc3NjEzNzM5fQ.mAbsM993ql7oMLTocejz1JDaP5AcKEAVwJazztlMvRE','2026-05-01 07:35:39','2026-04-01 05:35:39'),(116,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAyMTkwNiwiZXhwIjoxNzc3NjEzOTA2fQ.R0nzWywl9X9J7B56BfpnWEClyuXhb4-a4HWaRxZvEHI','2026-05-01 07:38:27','2026-04-01 05:38:26'),(117,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAyOTAzMCwiZXhwIjoxNzc3NjIxMDMwfQ._ZwupTR4eR1HpcoCmD3CQ0Qvp_fEhfIvUF5TLZJLo2s','2026-05-01 09:37:11','2026-04-01 07:37:10'),(118,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAyOTIxNCwiZXhwIjoxNzc3NjIxMjE0fQ.50-nXQrvukG367-hkDHG55Ga0M3vb1wqE49xZvA3Sy4','2026-05-01 09:40:15','2026-04-01 07:40:14'),(119,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAyOTU5MiwiZXhwIjoxNzc3NjIxNTkyfQ.2o8QyrhB4CEGmPCjAB6smedxbDAWfhhJeTboMgjA3No','2026-05-01 09:46:33','2026-04-01 07:46:32'),(120,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAzMjAwOSwiZXhwIjoxNzc3NjI0MDA5fQ.Fv4Vvvc3HDferCnfO5OHExRCQBluMAxQ4c6ZpqAqxO8','2026-05-01 10:26:49','2026-04-01 08:26:49'),(121,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAzMjA3MywiZXhwIjoxNzc3NjI0MDczfQ.qGML-0B_e0rtZ8wkFEeunVmlyUy7GdXJtjer9CiLy5s','2026-05-01 10:27:54','2026-04-01 08:27:53'),(122,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTAzOTcwMiwiZXhwIjoxNzc3NjMxNzAyfQ.e5VaxkXaOh4R5uJdy5K37QKUG1otAHS3x3RdfDwc4X8','2026-05-01 12:35:03','2026-04-01 10:35:02'),(123,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA0MzYwMiwiZXhwIjoxNzc3NjM1NjAyfQ.rU-Ulhw9oxGXjqM2zpBQ39Eo6O4AbfTHVlSas2qokDA','2026-05-01 13:40:02','2026-04-01 11:40:02'),(124,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA0NDA4NywiZXhwIjoxNzc3NjM2MDg3fQ.sdNffzqMhRNBbA5p3CT8MVQtJhZWVW21phLfAV12XiQ','2026-05-01 13:48:08','2026-04-01 11:48:07'),(125,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA0NzE3MCwiZXhwIjoxNzc3NjM5MTcwfQ.aUopfksuHKwSyWhlfjeqh9Tos4JUsL-VKrh0MbW1YlQ','2026-05-01 14:39:30','2026-04-01 12:39:30'),(126,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA1MDAwOSwiZXhwIjoxNzc3NjQyMDA5fQ.ylpEm8Q4_l-e5bVlR08gBYzi3QOS3pmx_9CXc7mOupM','2026-05-01 15:26:50','2026-04-01 13:26:49'),(127,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA1MDEwMiwiZXhwIjoxNzc3NjQyMTAyfQ.trZtIYf4G9AyQLrY_Ajt4IEgWjjzASSbinl7cJo6JtE','2026-05-01 15:28:22','2026-04-01 13:28:22'),(128,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA1MDQzNiwiZXhwIjoxNzc3NjQyNDM2fQ.fZcCQP5zd11Ok08Jpvh5t1LDuUb1psi6N3R0di-RKRg','2026-05-01 15:33:57','2026-04-01 13:33:56'),(129,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA4MzE4MSwiZXhwIjoxNzc3Njc1MTgxfQ.teSu3eGjNMGbCfRc-gpT5nBfWQXL6H6Gf_RPpRCON7s','2026-05-02 00:39:42','2026-04-01 22:39:41'),(130,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTA4NTA5NSwiZXhwIjoxNzc3Njc3MDk1fQ.wBderqp2HYTS5TYSL9R-u6c0sOOXyxGS3RlRul8yrL4','2026-05-02 01:11:36','2026-04-01 23:11:35'),(131,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTE0MTAwNCwiZXhwIjoxNzc3NzMzMDA0fQ.J9QF4nXKnSsTrVbgz4zCuvhC1xdYUtLcH4vnqbY_480','2026-05-02 16:43:25','2026-04-02 14:43:24'),(132,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTE3NzE5MywiZXhwIjoxNzc3NzY5MTkzfQ.IlIg3hg-kXcGhdjba0CL212fVOr14lxCFXMwex4SQL0','2026-05-03 02:46:34','2026-04-03 00:46:33'),(133,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTIwODYyMSwiZXhwIjoxNzc3ODAwNjIxfQ.B1u_qlZhwONFSrUc6i1EyQqsG01pwAZePOy7Jw8cuFk','2026-05-03 11:30:22','2026-04-03 09:30:21'),(134,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTIwODcwMywiZXhwIjoxNzc3ODAwNzAzfQ.lwhcs2Qxq3ImTtUHad0zvUygC-JzWP3kO9ylBavlTpU','2026-05-03 11:31:44','2026-04-03 09:31:43'),(135,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTIwOTk2NCwiZXhwIjoxNzc3ODAxOTY0fQ.0X2b2_79gKxkrZLXa_8uq_NnGXAgdQF5k2xpCZo6a-M','2026-05-03 11:52:45','2026-04-03 09:52:44'),(136,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTIxMTk4OCwiZXhwIjoxNzc3ODAzOTg4fQ.cIwKUR4IesauRG_qqJs_0r4cOwthabAynU-eCdstxAU','2026-05-03 12:26:28','2026-04-03 10:26:28'),(137,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTIxMjAyNywiZXhwIjoxNzc3ODA0MDI3fQ.7BrBsRJRqmlAM-bRXjpn9CIH_ltfIX-2n1ErAHXYdiI','2026-05-03 12:27:07','2026-04-03 10:27:07'),(138,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTI5MjkwNSwiZXhwIjoxNzc3ODg0OTA1fQ.I5OpDhZPV29p_r4viUGWqcwPLRS_k_2vRW9wFvhjVcE','2026-05-04 10:55:05','2026-04-04 08:55:05'),(139,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTI5MjkzMiwiZXhwIjoxNzc3ODg0OTMyfQ.nKXy3rpil7E00e2a0jW2T9Phd5aaI3F2kUe_lPyWWT8','2026-05-04 10:55:33','2026-04-04 08:55:32'),(140,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTI5NTU4NywiZXhwIjoxNzc3ODg3NTg3fQ.21Oj1ZRx1pz8pHf9640NQOSDviOeu3SY1XO6kvGh_C0','2026-05-04 11:39:47','2026-04-04 09:39:47'),(141,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTMyODQyMSwiZXhwIjoxNzc3OTIwNDIxfQ.XrBFP88R0hY8Z81cGSDkxBYaLzk9ERVSzxdEQ3KLyUo','2026-05-04 20:47:02','2026-04-04 18:47:01'),(142,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTMyODc0NiwiZXhwIjoxNzc3OTIwNzQ2fQ.nUsOda8YdOWJhZ_5p2Qjgn2D5vDG5ioAzZFYuE6q6-c','2026-05-04 20:52:26','2026-04-04 18:52:26'),(143,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTMyODgxNywiZXhwIjoxNzc3OTIwODE3fQ.ItD6a7LYSHVDFi2PIHHQqDFq8TyU3I7zAPvZnFM4Fbs','2026-05-04 20:53:38','2026-04-04 18:53:37'),(144,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTMzMjgzOCwiZXhwIjoxNzc3OTI0ODM4fQ.7HBieiW48mSGhMu0VqAtCyPNM1JkyJE9SeFA7atK3lY','2026-05-04 22:00:39','2026-04-04 20:00:38'),(145,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTU0MjQwMCwiZXhwIjoxNzc4MTM0NDAwfQ.UD95ES86NRhG6sg_VUxQ8DZSqibKjKEtBb_S0i8Evw4','2026-05-07 08:13:20','2026-04-07 06:13:20'),(146,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTU0MzI2NiwiZXhwIjoxNzc4MTM1MjY2fQ.beFUfINtwNaMlLw_mLTOMK9rY-wAsJmUPc-TqVGH8UI','2026-05-07 08:27:46','2026-04-07 06:27:46'),(147,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY3MjczMSwiZXhwIjoxNzc4MjY0NzMxfQ.0s9ovJqAOeRdLNdQJWQrAcYMaBYwRIR-CVFcCk11D7g','2026-05-08 20:25:32','2026-04-08 18:25:31'),(148,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY3NzUyNSwiZXhwIjoxNzc4MjY5NTI1fQ.4VqOQ_8UDT9ZcVsOpWhqkiYTnUqIx5EuR-ehq7pXjQQ','2026-05-08 21:45:25','2026-04-08 19:45:25'),(149,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY3NzYxNywiZXhwIjoxNzc4MjY5NjE3fQ.ex-nYN_-wp1evnpgprBcvDfPlVr6X3k1h_GhCmDRTso','2026-05-08 21:46:58','2026-04-08 19:46:57'),(150,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY3ODAwMSwiZXhwIjoxNzc4MjcwMDAxfQ._hldByJHJyoAUQARUyS8WT-J3lFSmQX_EwETvm6ypmQ','2026-05-08 21:53:21','2026-04-08 19:53:21'),(151,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY3ODAxMywiZXhwIjoxNzc4MjcwMDEzfQ.1g6ThMKg_C1ooPw7Yos5B63SgIlHvVJwd1eSfY0WggY','2026-05-08 21:53:34','2026-04-08 19:53:33'),(152,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY4Mjk4NCwiZXhwIjoxNzc4Mjc0OTg0fQ.Q2h6BvgbFSbo-_l8uA2mJ9n6NA2x7Zc82qyjGrocoSM','2026-05-08 23:16:25','2026-04-08 21:16:24'),(153,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY4MzkxOCwiZXhwIjoxNzc4Mjc1OTE4fQ.ak_mZ7f0siE8Clmg2rvg2OLub3qAo4XQxuYRNttRYJY','2026-05-08 23:31:58','2026-04-08 21:31:58'),(154,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY4NTEyMiwiZXhwIjoxNzc4Mjc3MTIyfQ.zfRe5nSab1YQiUh2il0u1GHkJ6u6aV7vAb0VYcCN1D0','2026-05-08 23:52:03','2026-04-08 21:52:02'),(155,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY4NzM1NywiZXhwIjoxNzc4Mjc5MzU3fQ.EujH6XF-8nMcyI9TACAFf6oMK3FQli5TqwNnXCRGq4Y','2026-05-09 00:29:17','2026-04-08 22:29:17'),(156,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY4NzczOCwiZXhwIjoxNzc4Mjc5NzM4fQ.JTL1ia6vt2mhx3My2WcANya9JtlHiTHw2WKgAPHmRZo','2026-05-09 00:35:38','2026-04-08 22:35:38'),(157,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTY4Nzg0NiwiZXhwIjoxNzc4Mjc5ODQ2fQ.ozaW5TAK43ZUct7JEnD2tZFKkFYrvrrLzxnK3XcJCJM','2026-05-09 00:37:27','2026-04-08 22:37:26'),(158,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTcxNjUxOCwiZXhwIjoxNzc4MzA4NTE4fQ.Y3H3VHh2EcH0rKXVEyBk3hKKp3rl0QJ0Rwjk7Uj7PTM','2026-05-09 08:35:19','2026-04-09 06:35:18'),(159,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTc3NTUyNSwiZXhwIjoxNzc4MzY3NTI1fQ.GeeJCZgLJA3qIHMs8-N5xKygNBahOnwl8rBcDI5NARE','2026-05-10 00:58:45','2026-04-09 22:58:45'),(160,'U1775776687079','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTc3NjY4NzA3OSIsImlhdCI6MTc3NTc3NjY4NywiZXhwIjoxNzc4MzY4Njg3fQ.cfxKjJSyqbGdWOuKM3arsSHqNH1NTL0cN3LGBgcwH_o','2026-05-10 01:18:07','2026-04-09 23:18:07'),(161,'U1775803377018','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTgwMzM3NzAxOCIsImlhdCI6MTc3NTgwMzM3NywiZXhwIjoxNzc4Mzk1Mzc3fQ._8tiMlVC5882ZPIXnVZ-ZKLIZHpi3_xnOOFJx9J8Ous','2026-05-10 08:42:57','2026-04-10 06:42:57'),(162,'U1775803377018','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTgwMzM3NzAxOCIsImlhdCI6MTc3NTgwMzk4MSwiZXhwIjoxNzc4Mzk1OTgxfQ.dWuHTRBsBhicbtH3GEjs6ofvrjcMzYtb7cLcWN9V_hE','2026-05-10 08:53:02','2026-04-10 06:53:01'),(163,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTgwNjAwNywiZXhwIjoxNzc4Mzk4MDA3fQ.YdAELS5RO-jl_Jxw70xDIb7XVpaFjYJ0g3w7QW_FLZ4','2026-05-10 09:26:48','2026-04-10 07:26:47'),(164,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTgwNjI2NywiZXhwIjoxNzc4Mzk4MjY3fQ.qgTpJD0gYqlDKyodHDcVRZTGqwg3GiCwiB8TnHV9SI0','2026-05-10 09:31:07','2026-04-10 07:31:07'),(165,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTgwNjUyNywiZXhwIjoxNzc4Mzk4NTI3fQ.9i4HIZk6FstNOBuZbZexcy3Nxq4vJ52hjCZIhSChhSg','2026-05-10 09:35:28','2026-04-10 07:35:27'),(166,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTgwNjc3NiwiZXhwIjoxNzc4Mzk4Nzc2fQ.fAK9epg9Ln4Cxf3pyngbbCwt6dmv4MHmRPmSF6XIlzo','2026-05-10 09:39:37','2026-04-10 07:39:36'),(167,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTgwOTM2MSwiZXhwIjoxNzc4NDAxMzYxfQ.QwEwCYZwM1Biuh664XVlD1kSpKZktHVewDjif9Fiyeg','2026-05-10 10:22:42','2026-04-10 08:22:41'),(168,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTk3NjAzNywiZXhwIjoxNzc4NTY4MDM3fQ.OgkePL00nUP_RjC2aYrwtegDItsZENjNtrYnGpVfUfY','2026-05-12 08:40:38','2026-04-12 06:40:37'),(169,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTk4ODMwOCwiZXhwIjoxNzc4NTgwMzA4fQ.kscPJSL584zWNZFmvEAFwJFgQUegma7_7eRDsUTA-xE','2026-05-12 12:05:09','2026-04-12 10:05:08'),(170,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTk5NDgzMywiZXhwIjoxNzc4NTg2ODMzfQ.RvcY6E9H_7GSpgAm0vOm_RVw600FjU_HjoQ7SYZKIHg','2026-05-12 13:53:53','2026-04-12 11:53:53'),(171,'U1775995635200','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTk5NTYzNTIwMCIsImlhdCI6MTc3NTk5NTYzNSwiZXhwIjoxNzc4NTg3NjM1fQ.X7_NsBefntUV5qYXIcSvdVOyKz4fKn39d0zcDJpkovA','2026-05-12 14:07:15','2026-04-12 12:07:15'),(172,'U1775995771709','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTk5NTc3MTcwOSIsImlhdCI6MTc3NTk5NTc3MSwiZXhwIjoxNzc4NTg3NzcxfQ.00LWVkREA-nbUQT7AjR6WgOMwQ0KN6_meOTDvSo4qdc','2026-05-12 14:09:32','2026-04-12 12:09:31'),(173,'U1775995789811','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTk5NTc4OTgxMSIsImlhdCI6MTc3NTk5NTc4OSwiZXhwIjoxNzc4NTg3Nzg5fQ.NtUA1b4xVIDBOOlbzuQABawDCXmSLRWWlMxIaZiilhI','2026-05-12 14:09:50','2026-04-12 12:09:49'),(174,'U1775995635200','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTk5NTYzNTIwMCIsImlhdCI6MTc3NTk5NjA2NiwiZXhwIjoxNzc4NTg4MDY2fQ.La18GUFX4VxdTHD3aA882z35XOW1brEQOm4r5WV8XUk','2026-05-12 14:14:26','2026-04-12 12:14:26'),(175,'U1775995635200','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTk5NTYzNTIwMCIsImlhdCI6MTc3NTk5NjIxNCwiZXhwIjoxNzc4NTg4MjE0fQ.GnCL1vymAzlBXPoyqfqMM_suFrPuWXlzwgfKm50emhI','2026-05-12 14:16:55','2026-04-12 12:16:54'),(176,'U1774471453671','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NDQ3MTQ1MzY3MSIsImlhdCI6MTc3NTk5NjM2NywiZXhwIjoxNzc4NTg4MzY3fQ.SF1xBKFOXFzELWLtBuMwVKTnxGEbLce8h3y41EIbfbE','2026-05-12 14:19:27','2026-04-12 12:19:27'),(177,'U1775776687079','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTc3NjY4NzA3OSIsImlhdCI6MTc3NjExNzg1NiwiZXhwIjoxNzc4NzA5ODU2fQ.u3JVz10f_9PrB-ggDAHhjJMGErrg4Me1PYq4CxTmcHU','2026-05-14 00:04:17','2026-04-13 22:04:16'),(178,'U1775776687079','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTc3NjY4NzA3OSIsImlhdCI6MTc3NjExODA2NSwiZXhwIjoxNzc4NzEwMDY1fQ.BYbtPeD1OKMQ7JT2CeIvQnzWyee_mhGnTOcbiUNnM0k','2026-05-14 00:07:45','2026-04-13 22:07:45'),(179,'U1775776687079','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJVMTc3NTc3NjY4NzA3OSIsImlhdCI6MTc3NjExODA5NiwiZXhwIjoxNzc4NzEwMDk2fQ.Yq5UWuYk9xy2k7Td15pT6qeZIW2When-jzlNHXmnB0Q','2026-05-14 00:08:17','2026-04-13 22:08:16'),(181,'U1774471453671','894c8d4980287d2af61e883aedd7783d291f1617fded0fbd05490ee9916b7c69','2026-06-13 09:58:10','2026-04-14 07:58:10'),(182,'U1774471453671','0859e914cdbb37f21b6ba5ff06b0eb914b00073bb3877de13f4886d5ac100435','2026-06-13 10:04:32','2026-04-14 08:04:31'),(183,'U1774471453671','851abada4476f53f81c8eda2b77a96489446c6deeedc9856e5983f82eb08bfd8','2026-06-13 10:06:12','2026-04-14 08:06:12'),(188,'U1774471453671','0a34ed7f34aec380935094474a7faae7791c6a3cfc9bd047c22637c450de7493','2026-06-13 10:15:51','2026-04-14 08:15:50'),(189,'U1774471453671','c71ad42dd6f57864a30999b3ff764ad3691d41cb10837841655078accdf9bd52','2026-06-15 00:43:32','2026-04-15 22:43:32'),(190,'U1774471453671','845fef74d4c826ee79f036ca857ac30f8963c0842d25262a9ff047f6ca036d9b','2026-06-15 08:35:51','2026-04-16 06:35:50'),(191,'U1774471453671','d08b4125e14bf1d3d656d0c5537f4655d355f2bd01972418f6caa80d6cf40669','2026-06-15 08:36:09','2026-04-16 06:36:08'),(192,'U1774471453671','1a6de64788a8f35010cebae1a641acca0395df6133ac07f8ed27a55dfc613c09','2026-06-15 08:36:38','2026-04-16 06:36:38'),(193,'U1774471453671','2859163c25452724e562ded65efc4af711f94e37e5af8dfb02b2b583a75c12a3','2026-06-15 08:38:24','2026-04-16 06:38:23'),(196,'U1774471453671','133c816d1ea8a46e437e3d50dbca507c3e5cd62190fa8c78814a9e52d76ab2dd','2026-06-15 23:36:26','2026-04-16 21:36:25'),(197,'U1774471453671','5a072b88e1e6ab51262f43a4c189872bf1733aa31bebc47e8a764242b94ddc1c','2026-06-16 06:26:00','2026-04-17 04:25:59'),(198,'U1774471453671','0bbde964d39506006700b1e7280258cf9a8b3a2223d387e52e52dae63f0c7cf7','2026-06-16 06:27:07','2026-04-17 04:27:07'),(199,'U1774471453671','9bf88afcc8545c5f1c6fcad6180c1e09f6b027a630ed14901c43d6b6ff56371b','2026-06-16 07:44:29','2026-04-17 05:44:28'),(200,'U1774471453671','b43ed87a5eedd5062982f44246f04b28b15546869a813d6b7835c67dc39f73e2','2026-06-16 09:00:48','2026-04-17 07:00:48'),(201,'U1774471453671','5d381d8afb3d69e03c442d4ed4723f30de6bc1df07ed433d18341ed37f763dce','2026-06-17 05:05:30','2026-04-18 03:05:30'),(202,'U1774471453671','77c4fd639af5d6499727392add5eed09f734049fd59337e0935ddfdc8416dd6b','2026-06-17 05:05:34','2026-04-18 03:05:34'),(203,'U1774471453671','3f69745722fd79ad5513c3dc5eda142c717b13a916bd5bdc3b50285af8473717','2026-06-17 18:00:13','2026-04-18 16:00:13'),(204,'U1774471453671','b8db67a57e10455e55663429a7ada7d91a71b9678c752d780893ec7ad8b0a8dd','2026-06-18 12:00:08','2026-04-19 10:00:07'),(205,'U1774471453671','d39074467cc47d3066544a72104c44ee7847ed179e7f17573826261afdb9d951','2026-06-18 12:00:44','2026-04-19 10:00:44'),(206,'U1774471453671','38c434ab25a69489d40ad8245fe9af05aa4d17ef14a9c95dfdca3c3665b87921','2026-06-18 12:24:30','2026-04-19 10:24:29'),(207,'U1774471453671','db9cbefa4ac1abf5e73d139554b8648e3cef338012eca9b5cef807e5c108a2cb','2026-06-18 12:50:35','2026-04-19 10:50:35'),(208,'U1774471453671','e9f51220dc06f029734d96077f7a9ae346a63f46215448ec7a9078fc803d64bb','2026-06-18 14:03:22','2026-04-19 12:03:22'),(209,'U1774471453671','a55e3d36439aeb2e1647488ae0d61ed21542b6892793acf03373d057d26aef07','2026-06-19 07:29:08','2026-04-20 05:29:08'),(210,'U1774471453671','a647d8db459467bb76cbe63742c451fedb3f6589563c33b26c0c337ba96ed802','2026-06-19 11:41:05','2026-04-20 09:41:05'),(211,'U1774471453671','883dd446e4a33017fa39ed9d520292af337b160543bab321aca13a69375b3098','2026-06-19 11:41:07','2026-04-20 09:41:06'),(212,'U1774471453671','b3c14b108256c8d0c3694f447a791b16c36228aea87b82e4890377f16bcd0a9d','2026-06-19 11:41:07','2026-04-20 09:41:07'),(216,'U1774471453671','d340011c13099e27be7517216545fbac46af06417b8d904cdbd299390a87aee1','2026-06-19 12:08:12','2026-04-20 10:08:12'),(218,'U1774471453671','89f6d3ad0c5b102105a2b8eec249586a10a862a3437140927cbe2dc720f03094','2026-06-19 12:22:15','2026-04-20 10:22:14'),(219,'U1774471453671','8a70f3306fb2930ef4dfd359b47f4c5f1b83ccdfb0518852d95071761441a8b5','2026-06-19 12:29:25','2026-04-20 10:29:24'),(220,'U1774471453671','d8efe2cccca516a8386fd71aa125ac5e99d54b1db4d8fd37dbe8d6d1c2680b16','2026-06-19 13:45:48','2026-04-20 11:45:47'),(221,'U1774471453671','d8a0cd11b0930daab32c220fc4e9df93a186a9e62bbc4ab5ea96ea513d6c05f1','2026-06-19 15:43:12','2026-04-20 13:43:11'),(222,'U1774471453671','37a4be6f01926f0241f97b181d1ec729075a041059c00e6fe46ed511e7ade98f','2026-06-20 08:09:30','2026-04-21 06:09:30'),(223,'U1774471453671','73ff8ff1b19e043dd2efd3bae453a7940f41ad2be695c092f7a56a108476b440','2026-06-20 08:11:05','2026-04-21 06:11:05'),(225,'U1774471453671','e4d60e26e40c36ad3a8d2c908bd0dacd03e4b0a94e1ab93dc05f9658b291393b','2026-06-20 20:23:38','2026-04-21 18:23:38'),(226,'U1774471453671','96fd29ab17c6229c34f6ee65031ba8680d611669a29e098265005c9e3bb3ceb0','2026-06-20 22:12:19','2026-04-21 20:12:19'),(227,'U1774471453671','3ea58430786ba618c1d8f61f09a6973c2ce529484540e9c3ab41ac6f437e1740','2026-06-20 22:12:23','2026-04-21 20:12:23'),(228,'U1774471453671','65d35025b597a4b5645e6cdfb5a4f4e8454c48fe569338f56a3d22d6c11008c0','2026-06-20 22:42:18','2026-04-21 20:42:18'),(229,'U1774471453671','2e827eedf2fbfeee2b288740c940021c3bb82f06c89ec5f78fac70d76b952a57','2026-06-23 07:17:07','2026-04-24 05:17:07'),(230,'U1777010178142','efba1c791322ac158daa9cb93215a0e9973473193b05c2938b237f8df00c612a','2026-06-23 07:56:18','2026-04-24 05:56:18'),(231,'U1774471453671','36e3178e452a9526ca341973b89ab78cc55c967dca482a91798d275079d9d39c','2026-06-24 09:44:28','2026-04-25 07:44:28'),(232,'U1774471453671','966a6d2206cef334485adea72016027677786d86af73ec6cdf500def6cb60509','2026-06-24 10:13:08','2026-04-25 08:13:07'),(233,'U1774471453671','5020d215c051fe9a55330b7e7cde9ded991b1e418d871370f5e458dc4bd61fe7','2026-06-24 11:27:43','2026-04-25 09:27:43'),(234,'U1774471453671','1e8f386d3ae804d368a034cd7adc4d0188b636ee81319f794de85f3c94a63fe1','2026-06-24 11:54:19','2026-04-25 09:54:19'),(235,'U1774471453671','ed826064cbbb91b29a5524804ad3e761852edbdf9814de9bd86d6eee35e2d649','2026-06-24 12:07:19','2026-04-25 10:07:18'),(236,'U1774471453671','5cc84b89eab143b41ddbed8c068ace2ce879594aca4e3b621cf8e3b53cf1dead','2026-06-25 00:15:07','2026-04-25 22:15:07'),(239,'U1774471453671','b5edf0b0f0bc97f5f3fa22d7e7bd3a717e56e5157344455c57700575e53b7f7a','2026-06-25 00:42:28','2026-04-25 22:42:28'),(240,'U1774471453671','3a182011f8fea8f9bf6d751af5fd7803941b5de4e816cf22e27159d3af0414d0','2026-06-25 01:16:25','2026-04-25 23:16:24'),(241,'U1774471453671','a131e13e0869cb9ed84b6e12deb014a7eed6d6f1f9ab8851319da2c7ef531966','2026-06-25 01:19:49','2026-04-25 23:19:49'),(242,'U1774471453671','0d08d14e2fa493b8b79578fa2a7e7568f8f8e774bebdc4fc123d5fd16ce9e8c4','2026-06-25 01:31:43','2026-04-25 23:31:43'),(243,'U1774471453671','99a6f4f1ddeb5222a299a13b31e6c97f4442795a510c78a6073465b2397c7734','2026-06-25 01:51:12','2026-04-25 23:51:12'),(244,'U1774471453671','1b3d6ae06c8497288101dcfc78dc3c9d543e4645611554c0396418816f215ad6','2026-06-25 02:25:09','2026-04-26 00:25:08'),(245,'U1774471453671','097319c799b87b85206b6ccac7d5f657c978782ebcaa77c3382c023148f1bf37','2026-06-25 22:41:10','2026-04-26 20:41:09'),(246,'U1774471453671','384f9002408b05cbd71faa14d586f91a16473ac4382d08c8a21d913dbb036c8c','2026-06-25 22:41:18','2026-04-26 20:41:17'),(249,'U1774471453671','52e4095dcafb4c6162125a33af9a77c3ac1024caeb8e772599f3e726cd5de9ee','2026-06-25 23:13:29','2026-04-26 21:13:29'),(251,'U1774471453671','387db7a5009d6e2ceced057b51c1ecb6979b18183c216b4dfd46793ecd726704','2026-06-26 06:49:44','2026-04-27 04:49:44'),(252,'U1774471453671','b7cef5056c728431a4ae401d6cd156f4f89a8379c4af3f64a1aba61e57c93aa7','2026-06-26 07:35:40','2026-04-27 05:35:40'),(253,'U1774471453671','e0a0df808a51af39233f905792239222f134de5936988b5c0722f72f21e95a06','2026-06-26 07:36:52','2026-04-27 05:36:51'),(254,'U1774471453671','9618940f337d9613bcab66a4cbdb15d742c35d6fd871d1a7721589ef18ceba0c','2026-06-26 07:58:58','2026-04-27 05:58:57');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reporter_id` varchar(50) NOT NULL,
  `reported_type` enum('user','post','message') NOT NULL,
  `reported_id` varchar(50) NOT NULL,
  `category` enum('spam','harassment','scam_fraud','inappropriate_content','fake_profile','other') NOT NULL,
  `description` text,
  `status` enum('pending','reviewed','actioned') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reporter` (`reporter_id`),
  KEY `idx_reported` (`reported_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (1,'U1774471453671','user','p2','spam','Sending spam messages','actioned','2026-04-16 06:36:38');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(50) NOT NULL,
  `customerName` varchar(100) DEFAULT NULL,
  `providerId` varchar(50) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `serviceName` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('R1','Max T.','p1',5,'Exceptional gardening work!','Gardening','Approved','2023-11-21'),('R10','Nina K.','p7',5,'Life-changing yoga sessions.','Yoga','Approved','2023-12-11'),('R11','Omar F.','p5',4,'Tom moved everything safely.','Moving','Approved','2023-12-09'),('R12','Elena G.','p1',5,'My garden is now a paradise.','Gardening','Approved','2023-12-15'),('R13','Chris B.','p6',5,'Perfect custom shelves.','Handyman','Pending','2023-12-17'),('R14','Maria S.','p2',5,'Kids love Emma!','Babysitting','Approved','2023-12-18'),('R15','Paul V.','p10',5,'Best plumber in the city.','Handyman','Approved','2023-12-18'),('R16','Lilly Q.','p8',3,'Took a bit longer than expected.','IT Support','Flagged','2023-12-19'),('R17','Jacob W.','p3',5,'Incredible spices and flavors.','Cooking','Approved','2023-12-20'),('R18','Tina M.','p9',5,'She captured my brand perfectly.','Photography','Approved','2023-12-21'),('R2','Julia P.','p1',5,'Sarah transformed my patio.','Gardening','Approved','2023-11-22'),('R3','Markus W.','p6',5,'Marcus is a master with wood.','Handyman','Approved','2023-12-02'),('R4','Leo H.','p10',4,'Fixed our leak quickly.','Handyman','Approved','2023-11-26'),('R5','Anna S.','p2',5,'Highly recommended for kids.','Babysitting','Approved','2023-12-06'),('R6','Ken J.','p11',5,'The sushi was authentic.','Cooking','Approved','2023-11-29'),('R7','Felix B.','p3',5,'Great curry, very clean.','Cooking','Approved','2023-12-01'),('R8','Sarah L.','p9',5,'Beautiful event photos.','Photography','Approved','2023-12-05'),('R9','David R.','p4',4,'Very helpful with my PC.','IT Support','Approved','2023-12-16');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL,
  `description` text,
  `status` varchar(20) DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES ('S1','Cleaning','Home','🧹','Home and office cleaning by vetted professionals.','Active'),('S10','Massage','Wellness','💆','Professional home massage for relaxation and recovery.','Active'),('S11','Math','Skills','📐','One-on-one math lessons for all ages and levels.','Active'),('S12','IT Support','Skills','💻','Tech help, device setup, and troubleshooting.','Active'),('S1777101866973','Test Service','Home','🧪','Test','Active'),('S2','Gardening','Home','🌱','Lawn care, planting, and garden maintenance.','Active'),('S3','Handyman','Home','🔧','General home repairs and installations.','Active'),('S4','Babysitting','Care','👶','Trusted childcare in your own home.','Active'),('S5','Elder Care','Care','🧓','Companionship, light assistance, and care for elderly.','Active'),('S6','Pet Care','Care','🐕','Dog walking, pet sitting, and grooming.','Active'),('S7','Transport','Transport','🚗','Reliable rides for errands, events, and daily travel.','Active'),('S8','Groceries','Transport','🛒','Grocery shopping and delivery to your door.','Active'),('S9','Cooking','Wellness','👨‍🍳','Home-cooked meals prepared fresh by local chefs.','Active');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_applications`
--

DROP TABLE IF EXISTS `task_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_applications` (
  `id` varchar(50) NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `provider_id` varchar(50) NOT NULL,
  `message` text,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_applications`
--

LOCK TABLES `task_applications` WRITE;
/*!40000 ALTER TABLE `task_applications` DISABLE KEYS */;
INSERT INTO `task_applications` VALUES ('TA1776325769013','T1776321503758','U1774471453671',NULL,'pending','2026-04-16 07:49:29'),('TA1777103800550','T1777010197255','U1774471453671',NULL,'pending','2026-04-25 07:56:40');
/*!40000 ALTER TABLE `task_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` varchar(50) NOT NULL,
  `poster_id` varchar(50) NOT NULL,
  `assigned_provider_id` varchar(50) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `category` varchar(50) NOT NULL,
  `budget` float DEFAULT NULL,
  `task_date` date DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_poster` (`poster_id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES ('T1776321503758','p1',NULL,'Duplicate Task Test',NULL,'Home',NULL,NULL,NULL,'open','2026-04-16 06:38:23',NULL,NULL),('T1777010197255','test123',NULL,'Test Task',NULL,'Cleaning',NULL,NULL,NULL,'open','2026-04-24 05:56:37',NULL,NULL),('T1777107984245','p1',NULL,'Test Task',NULL,'Home',NULL,NULL,NULL,'open','2026-04-25 09:06:24',NULL,NULL),('T1777109129794','p1',NULL,'Fix my kitchen sink',NULL,'Home',NULL,NULL,NULL,'open','2026-04-25 09:25:29',NULL,NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_blocks`
--

DROP TABLE IF EXISTS `user_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `blocker_id` varchar(50) NOT NULL,
  `blocked_id` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_block` (`blocker_id`,`blocked_id`),
  KEY `idx_blocker` (`blocker_id`),
  KEY `idx_blocked` (`blocked_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_blocks`
--

LOCK TABLES `user_blocks` WRITE;
/*!40000 ALTER TABLE `user_blocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(20) DEFAULT 'Customer',
  `status` varchar(20) DEFAULT 'Active',
  `avatar` varchar(255) DEFAULT NULL,
  `onboarded` tinyint(1) DEFAULT '0',
  `provider` varchar(20) DEFAULT 'Email',
  `bio` text,
  `rating` float DEFAULT '5',
  `street_name` varchar(100) DEFAULT NULL,
  `street_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `languages` varchar(100) DEFAULT NULL,
  `years` int DEFAULT '0',
  `phone` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rate` float DEFAULT '0',
  `availability` text,
  `service_categories` text,
  `password` varchar(255) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  `terms_accepted_at` datetime DEFAULT NULL,
  `trust_level` enum('new_user','verified_user','trusted_user') DEFAULT 'new_user',
  `trust_score` decimal(5,2) DEFAULT '0.00',
  `risk_score` decimal(5,2) DEFAULT '0.00',
  `terms_version` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin-001','System Admin','admin@servicelink.com','Admin','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=admin',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2025-12-31 14:40:10',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('c1','Julia Peters','julia@example.com','Customer','Active','https://randomuser.me/api/portraits/women/33.jpg',1,'Email','Regular marketplace user looking for garden maintenance.',5,'Kastanienallee','12','Berlin','Germany','10435','DE',0,NULL,'2025-12-31 14:40:10',0,NULL,NULL,NULL,NULL,52.52,13.405,NULL,'new_user',0.00,0.00,NULL),('c2','Markus Wolf','markus.w@example.com','Customer','Active','https://randomuser.me/api/portraits/men/3.jpg',1,'Email','Property owner frequently hiring handymen.',5,'Leipziger Str.','125','Berlin','Germany','10117','DE',0,NULL,'2025-12-31 14:40:10',0,NULL,NULL,NULL,NULL,52.52,13.405,NULL,'new_user',0.00,0.00,NULL),('c3','Hanna Berg','hanna@example.com','Customer','Active','https://randomuser.me/api/portraits/women/40.jpg',1,'Email','New resident in Berlin seeking local help.',5,'Allee der Kosmonauten','10','Berlin','Germany','12681','DE, EN',0,NULL,'2025-12-31 14:40:10',0,NULL,NULL,NULL,NULL,52.52,13.405,NULL,'new_user',0.00,0.00,NULL),('p1','Sarah Martinez','sarah@example.com','Provider','Active','https://randomuser.me/api/portraits/women/65.jpg',1,'Email','Gardening expert and plant lover.',5,'Invalidenstrasse','12','Berlin','Germany','10115','EN, DE',3,NULL,'2025-12-31 14:40:10',0,NULL,'Gardening',NULL,NULL,52.525,13.41,NULL,'new_user',0.00,0.00,NULL),('p10','Lars Schmidt','lars.s@example.com','Provider','Active','https://randomuser.me/api/portraits/men/77.jpg',1,'Email','Plumbing and heating technician.',4.8,'Mullerstrasse','156','Berlin','Germany','13353','DE',20,NULL,'2025-12-31 14:40:10',0,NULL,'Math Tuition',NULL,NULL,52.508,13.385,NULL,'new_user',0.00,0.00,NULL),('p11','Yuki Tanaka','yuki.t@example.com','Provider','Active','https://randomuser.me/api/portraits/women/50.jpg',1,'Email','Traditional Japanese meals.',5,'Kastanienallee','12','Berlin','Germany','10435','JP, EN',15,NULL,'2025-12-31 14:40:10',0,NULL,'Groceries',NULL,NULL,52.519,13.405,NULL,'new_user',0.00,0.00,NULL),('p2','Emma Johnson','emma@example.com','Provider','Active','https://randomuser.me/api/portraits/women/44.jpg',1,'Email','Childcare and early education.',5,'Skalitzer Strasse','88','Berlin','Germany','10997','EN',5,NULL,'2025-12-31 14:40:10',0,NULL,'Babysitting',NULL,NULL,52.51,13.39,NULL,'verified_user',45.00,20.00,NULL),('p3','Raj Patel','raj@example.com','Provider','Active','https://randomuser.me/api/portraits/men/29.jpg',1,'Email','Private chef specializing in Indian cuisine.',4.8,'Sonnenallee','210','Berlin','Germany','12059','EN, HI',7,NULL,'2025-12-31 14:40:10',0,NULL,'Cooking',NULL,NULL,52.5155,13.402,NULL,'new_user',0.00,0.00,NULL),('p4','Lisa Wong','lisa@example.com','Provider','Active','https://randomuser.me/api/portraits/women/12.jpg',1,'Email','Hardware tech and smart home specialist.',4.7,'Kantstrasse','45','Berlin','Germany','10625','EN, DE',4,NULL,'2025-12-31 14:40:10',0,NULL,'IT Support',NULL,NULL,52.53,13.38,NULL,'new_user',0.00,0.00,NULL),('p5','Tom Becker','tom@example.com','Provider','Active','https://randomuser.me/api/portraits/men/51.jpg',1,'Email','Moving specialist with heavy lifting experience.',4.6,'Boxhagener Strasse','76','Berlin','Germany','10245','DE',6,NULL,'2025-12-31 14:40:10',0,NULL,'Moving',NULL,NULL,52.5,13.42,NULL,'new_user',0.00,0.00,NULL),('p6','Marcus Weber','marcus@example.com','Provider','Active','https://randomuser.me/api/portraits/men/32.jpg',1,'Email','Master carpenter and handyman.',4.9,'Veteranstrasse','5','Berlin','Germany','10119','DE, EN',12,NULL,'2025-12-31 14:40:10',0,NULL,'Cleaning',NULL,NULL,52.518,13.425,NULL,'new_user',0.00,0.00,NULL),('p7','Elena Rossi','elena@example.com','Provider','Active','https://randomuser.me/api/portraits/women/22.jpg',1,'Email','Yoga instructor, Vinyasa and Hatha.',0,'Torstrasse','140','Berlin','Germany','10115','IT, EN, DE',8,NULL,'2025-12-31 14:40:10',0,NULL,'Handyman',NULL,NULL,52.507,13.415,NULL,'new_user',0.00,0.00,NULL),('p8','David Kim','david@example.com','Provider','Active','https://randomuser.me/api/portraits/men/45.jpg',1,'Email','Software troubleshooting and repairs.',5,'Oranienburger Str.','27','Berlin','Germany','10117','EN, KR',4,NULL,'2025-12-31 14:40:10',0,NULL,'Driver',NULL,NULL,52.522,13.395,NULL,'new_user',0.00,0.00,NULL),('p9','Sophie Muller','sophie.m@example.com','Provider','Active','https://randomuser.me/api/portraits/women/31.jpg',1,'Email','Portrait and event photography.',4.9,'Friedrichstrasse','43','Berlin','Germany','10117','DE, EN',10,NULL,'2025-12-31 14:40:10',0,NULL,'Pet Care',NULL,NULL,52.513,13.43,NULL,'new_user',0.00,0.00,NULL),('U1767192260816','Mujtaba','verified.google.user@gmail.com','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=verified.google.user@gmail.com',1,'Google','English, German',5,NULL,NULL,NULL,NULL,NULL,'EN, DE',10,'017655509575','2025-12-31 14:44:20',3,'weekday_morning','IT Support',NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1774471453671','Demo User','demo@helphub.app','Customer','Active','/uploads/avatar_U1774471453671_02f099f3-5aab-448a-8ef1-7640d715ac58.jpeg',1,'Email','Test bio',5,'Baker Street','221B','Berlin','DE','10115','EN',5,NULL,'2026-03-25 20:44:13',0,'evening','Driver,Gardening',NULL,'Berlin',52.52,13.405,'2026-04-27 08:08:58','new_user',0.00,0.00,'1.0'),('U1774505047067','test','test@helphub.com','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=test@helphub.com',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-03-26 06:04:07',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1774514142307','mujtaba','mujtabaahmed556@gmail.com','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=mujtabaahmed556@gmail.com',1,'Email','Driver test',5,NULL,NULL,NULL,NULL,NULL,'EN,DE',5,'012345','2026-03-26 08:35:42',15,'weekday_evening','Transport',NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1774548300340','admin','admin@example.com','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=admin@example.com',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-03-26 18:05:00',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1775776687079','test','test@example.com','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=test%40example.com',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-04-09 23:18:07',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1775803377018','test','test@helphub.app','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=test%40helphub.app',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-04-10 06:42:57',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1775995635200','Alex Rivera','alex.rivera@helphub.demo','Provider','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=alex.rivera@helphub.demo',1,'Email','Professional driver and transport specialist with 6 years of experience. Safe, punctual rides across Berlin.',5,'Unter den Linden','42','Berlin','Germany','10117','EN, ES, DE',6,'+49 30 555 0199','2026-04-12 12:07:15',28,'Weekdays,Weekends','Transport',NULL,'Berlin',52.517,13.3888,NULL,'new_user',0.00,0.00,NULL),('U1775995771709','demo','demo@helphub.demo','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=demo@helphub.demo',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-04-12 12:09:31',0,'',NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1775995789811','testdemo','testdemo@helphub.demo','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=testdemo@helphub.demo',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-04-12 12:09:49',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL),('U1777010178142','test','test@test.com','Customer','Active','https://api.dicebear.com/7.x/avataaars/svg?seed=test@test.com',1,'Email',NULL,5,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,'2026-04-24 05:56:18',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'new_user',0.00,0.00,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'servicelink_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-27  8:29:40
