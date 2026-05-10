mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 5.7.39, for osx11.0 (x86_64)
--
-- Host: 127.0.0.1    Database: servicelink_db
-- ------------------------------------------------------
-- Server version	5.7.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `provider_id` varchar(50) NOT NULL,
  `service` varchar(100) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time` varchar(20) DEFAULT NULL,
  `message` text,
  `status` varchar(20) DEFAULT 'pending',
  `is_seen` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('bk001','c1','p6','Cleaning','2025-04-10','09:00','Please bring your own cleaning supplies.','completed',1,'2025-04-05 08:00:00',90.00),('bk002','c2','p2','Babysitting','2025-04-12','18:00','Two kids, ages 4 and 7. Need someone till 22:00.','completed',1,'2025-04-07 09:00:00',100.00),('bk003','c1','p3','Cooking','2025-04-15','17:00','Dinner for 6 guests. Please prepare a 3-course meal.','completed',1,'2025-04-09 12:00:00',180.00),('bk004','c4','p4','IT Support','2025-04-18','14:00','Laptop very slow, need OS reinstall and data backup.','completed',1,'2025-04-12 07:00:00',100.00),('bk005','c5','p1','Gardening','2025-04-20','08:00','Full garden tidy â€” mowing, pruning, and weeding.','completed',1,'2025-04-14 06:30:00',140.00),('bk006','c3','p13','Elder Care','2025-04-22','08:00','Morning care visit for my mother, Mon-Fri.','confirmed',1,'2025-04-16 08:00:00',112.00),('bk007','c2','p10','Math Tuition','2025-04-25','16:00','My son needs help with algebra and geometry.','confirmed',1,'2025-04-18 11:00:00',60.00),('bk008','c6','p5','Transport','2025-04-28','10:00','Moving boxes from Mitte to Neukoelln. About 20 boxes.','confirmed',1,'2025-04-20 07:00:00',120.00),('bk009','c5','p9','Pet Care','2025-05-02','07:30','Daily dog walk, 45 minutes, Mon-Fri.','confirmed',1,'2025-04-25 08:00:00',20.00),('bk010','c1','p12','Massage','2025-05-05','11:00','Deep tissue, 60 minutes. Focus on shoulders and back.','confirmed',1,'2025-04-28 10:00:00',70.00),('bk011','c4','p7','Handyman','2025-05-06','09:00','Mount TV on wall and install 3 shelves.','pending',0,'2025-05-01 12:00:00',110.00),('bk012','c6','p11','Groceries','2025-05-07','10:00','Weekly grocery run â€” list attached in message.','pending',0,'2025-05-03 07:00:00',30.00),('bk013','c3','p6','Cleaning','2025-05-08','08:00','Deep clean of 3-bedroom apartment.','pending',0,'2025-05-04 09:00:00',150.00),('bk014','c2','p3','Cooking','2025-05-09','18:00','Birthday dinner for my wife, surprise menu please!','pending',0,'2025-05-05 08:00:00',160.00),('bk015','c1','p1','Gardening','2025-05-10','09:00','Plant spring bulbs and lay new turf in the back garden.','pending',0,'2025-05-06 06:00:00',175.00),('bk016','c4','p8','Transport','2025-03-10','05:00','Airport drop-off for 06:30 flight to London.','completed',1,'2025-03-05 19:00:00',45.00),('bk017','c3','p7','Handyman','2025-03-20','10:00','Fix leaking tap in bathroom.','completed',1,'2025-03-15 08:00:00',55.00),('bk018','c5','p6','Cleaning','2025-03-28','09:00','End-of-tenancy clean, needs to be spotless.','completed',1,'2025-03-22 10:00:00',200.00),('bk019','c6','p2','Babysitting','2025-04-05','19:00','Just for the evening, 19:00-23:00.','completed',1,'2025-04-01 14:00:00',80.00),('bk020','c2','p4','IT Support','2025-04-01','15:00','Home network keeps dropping â€” please diagnose and fix.','declined',1,'2025-03-28 09:00:00',50.00);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversations` (
  `id` varchar(50) NOT NULL,
  `participant_1` varchar(50) NOT NULL,
  `participant_2` varchar(50) NOT NULL,
  `last_message` text,
  `last_message_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_p1` (`participant_1`),
  KEY `idx_p2` (`participant_2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('cv001','c1','p6','See you at 9am on Thursday then!','2025-05-04 09:30:00','2025-05-03 08:00:00'),('cv002','c2','p2','Great, the kids are excited to meet you.','2025-05-03 17:00:00','2025-05-02 16:00:00'),('cv003','c4','p4','I will bring my diagnostic tools too.','2025-05-04 14:30:00','2025-05-04 12:00:00'),('cv004','c5','p9','Buddy loves morning walks, he will be ready!','2025-05-05 06:00:00','2025-05-04 07:00:00'),('cv005','c3','p13','Mum really liked you at the assessment visit.','2025-05-05 08:00:00','2025-05-03 09:00:00');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_tokens`
--

DROP TABLE IF EXISTS `device_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `token` text NOT NULL,
  `platform` varchar(20) DEFAULT 'android',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_tokens`
--

LOCK TABLES `device_tokens` WRITE;
/*!40000 ALTER TABLE `device_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `device_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direct_messages`
--

DROP TABLE IF EXISTS `direct_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `direct_messages` (
  `id` varchar(50) NOT NULL,
  `conversation_id` varchar(50) NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation` (`conversation_id`),
  KEY `idx_sender` (`sender_id`),
  KEY `idx_unread` (`conversation_id`,`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direct_messages`
--

LOCK TABLES `direct_messages` WRITE;
/*!40000 ALTER TABLE `direct_messages` DISABLE KEYS */;
INSERT INTO `direct_messages` VALUES ('dm001','cv001','c1','Hi Sophie, just confirming our booking for Thursday morning.',1,'2025-05-03 08:00:00'),('dm002','cv001','p6','Hello Alice! Yes, confirmed. I will be there at 9am sharp.',1,'2025-05-03 08:15:00'),('dm003','cv001','c1','Perfect! Do you need a parking spot?',1,'2025-05-03 08:20:00'),('dm004','cv001','p6','That would be great, thank you!',1,'2025-05-03 08:25:00'),('dm005','cv001','c1','See you at 9am on Thursday then!',1,'2025-05-04 09:30:00'),('dm006','cv002','c2','Hi Lena, the boys are looking forward to meeting you on Saturday.',1,'2025-05-02 16:00:00'),('dm007','cv002','p2','How lovely! What are their favourite games so I can prepare?',1,'2025-05-02 16:10:00'),('dm008','cv002','c2','Lego and anything outdoors! We have a garden.',1,'2025-05-02 16:15:00'),('dm009','cv002','p2','Perfect. I will bring some craft activities too.',1,'2025-05-03 07:00:00'),('dm010','cv002','c2','Great, the kids are excited to meet you.',0,'2025-05-03 17:00:00'),('dm011','cv003','c4','Hi Jan, I need my whole home network set up plus a printer.',1,'2025-05-04 12:00:00'),('dm012','cv003','p4','No problem at all, I can handle that. What router do you have?',1,'2025-05-04 12:20:00'),('dm013','cv003','c4','It is a Fritz!Box 7590.',1,'2025-05-04 12:25:00'),('dm014','cv003','p4','Great router. I will bring my diagnostic tools too.',0,'2025-05-04 14:30:00'),('dm015','cv004','c5','Hi Nina, Buddy will be ready at 7:30am each morning.',1,'2025-05-04 07:00:00'),('dm016','cv004','p9','Wonderful! I will send a photo update after each walk.',1,'2025-05-04 07:15:00'),('dm017','cv004','c5','That would be lovely, thank you!',1,'2025-05-04 07:20:00'),('dm018','cv004','c5','Buddy loves morning walks, he will be ready!',0,'2025-05-05 06:00:00'),('dm019','cv005','c3','Hello Amira, thank you so much for your patience with mum.',1,'2025-05-03 09:00:00'),('dm020','cv005','p13','It is my pleasure. She is a wonderful lady.',1,'2025-05-03 09:10:00'),('dm021','cv005','c3','She keeps talking about you between visits!',1,'2025-05-04 07:00:00'),('dm022','cv005','p13','That makes me so happy to hear.',1,'2025-05-04 07:05:00'),('dm023','cv005','c3','Mum really liked you at the assessment visit.',0,'2025-05-05 08:00:00');
/*!40000 ALTER TABLE `direct_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `magic_link_tokens`
--

DROP TABLE IF EXISTS `magic_link_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `magic_link_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_ml_token_hash` (`token_hash`),
  KEY `idx_ml_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `magic_link_tokens`
--

LOCK TABLES `magic_link_tokens` WRITE;
/*!40000 ALTER TABLE `magic_link_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `magic_link_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `booking_id` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_unread` (`user_id`,`is_read`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'p6','booking_request','New Booking Request','Alice Weber has requested a Cleaning session on 10 Apr.','bk001',1,'2025-04-05 08:00:00'),(2,'c1','booking_accepted','Booking Confirmed','Sophie Lefebvre confirmed your Cleaning booking on 10 Apr.','bk001',1,'2025-04-05 09:00:00'),(3,'c1','booking_completed','Booking Completed','Your Cleaning session with Sophie Lefebvre is complete.','bk001',1,'2025-04-10 12:00:00'),(4,'p2','booking_request','New Booking Request','Ben MÃ¼ller has requested Babysitting on 12 Apr.','bk002',1,'2025-04-07 09:00:00'),(5,'c2','booking_accepted','Booking Confirmed','Lena Bauer confirmed your Babysitting booking on 12 Apr.','bk002',1,'2025-04-07 10:00:00'),(6,'p3','booking_request','New Booking Request','Alice Weber has requested a Cooking session on 15 Apr.','bk003',1,'2025-04-09 12:00:00'),(7,'c1','booking_accepted','Booking Confirmed','Ahmed Hassan confirmed your Cooking booking on 15 Apr.','bk003',1,'2025-04-09 13:00:00'),(8,'p4','booking_request','New Booking Request','David Park has requested IT Support on 18 Apr.','bk004',1,'2025-04-12 07:00:00'),(9,'c4','booking_accepted','Booking Confirmed','Jan Kowalski confirmed your IT Support booking on 18 Apr.','bk004',1,'2025-04-12 08:00:00'),(10,'p7','booking_request','New Booking Request','David Park has requested Handyman services on 6 May.','bk011',0,'2025-05-01 12:00:00'),(11,'p11','booking_request','New Booking Request','Fatima Al-Hassan has requested Groceries delivery on 7 May.','bk012',0,'2025-05-03 07:00:00'),(12,'p6','booking_request','New Booking Request','Clara Novak has requested Cleaning on 8 May.','bk013',0,'2025-05-04 09:00:00'),(13,'p3','booking_request','New Booking Request','Ben MÃ¼ller has requested Cooking on 9 May.','bk014',0,'2025-05-05 08:00:00'),(14,'p1','booking_request','New Booking Request','Alice Weber has requested Gardening on 10 May.','bk015',0,'2025-05-06 06:00:00'),(15,'c4','booking_declined','Booking Declined','Jan Kowalski could not take your IT Support booking on 1 Apr.','bk020',1,'2025-03-29 09:00:00'),(16,'p1','task_application','Task Assigned','You have been assigned to: Garden clearance after winter.','tk002',1,'2025-05-01 10:00:00'),(17,'p6','task_application','Task Assigned','You have been assigned to: Deep clean after renovation.','tk007',1,'2025-05-02 12:00:00'),(18,'c2','task_assigned','Task Assigned','Maria Schmidt will handle your garden clearance.','tk002',1,'2025-05-01 10:30:00'),(19,'c1','task_assigned','Task Assigned','Sophie Lefebvre will handle your post-reno clean.','tk007',1,'2025-05-02 13:00:00'),(20,'c1','direct_message','New Message','Sophie Lefebvre sent you a message.',NULL,1,'2025-05-03 08:15:00'),(21,'p6','direct_message','New Message','Alice Weber sent you a message.',NULL,1,'2025-05-03 08:00:00'),(22,'c2','direct_message','New Message','Lena Bauer sent you a message.',NULL,0,'2025-05-03 17:00:00'),(23,'c4','direct_message','New Message','Jan Kowalski sent you a message.',NULL,0,'2025-05-04 14:30:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider_id` varchar(50) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `reviewer_name` varchar(100) DEFAULT NULL,
  `stars` int(11) NOT NULL,
  `comment` text,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES (1,'p1','c1','Alice Weber',5,'Maria completely transformed our backyard. Punctual and thorough!','approved','2025-04-01 08:00:00'),(2,'p1','c5','Emma Fischer',5,'The garden looks stunning. Will definitely book again.','approved','2025-04-10 12:00:00'),(3,'p1','c3','Clara Novak',4,'Great work overall, arrived a bit late but the quality was excellent.','approved','2025-04-15 07:00:00'),(4,'p2','c2','Ben MÃ¼ller',5,'Lena is absolutely brilliant with the kids. They love her!','approved','2025-03-25 17:00:00'),(5,'p2','c6','Fatima Al-Hassan',5,'Very professional and caring. Highly recommend.','approved','2025-04-05 18:00:00'),(6,'p3','c1','Alice Weber',5,'Ahmed cooked an amazing dinner for our guests. Outstanding flavours!','approved','2025-03-20 20:00:00'),(7,'p3','c4','David Park',4,'Delicious food, good portions. One dish was a bit spicy for my taste.','approved','2025-04-02 18:30:00'),(8,'p4','c4','David Park',5,'Fixed my laptop and set up my home network in under 2 hours. Genius!','approved','2025-03-15 15:00:00'),(9,'p4','c2','Ben MÃ¼ller',4,'Jan sorted out my router issue remotely â€” very efficient.','approved','2025-04-01 13:00:00'),(10,'p5','c6','Fatima Al-Hassan',4,'Klaus was careful with all my furniture. Only minor issue with timing.','approved','2025-04-08 09:00:00'),(11,'p6','c1','Alice Weber',5,'My apartment has never been this clean. Sophie is a magician!','approved','2025-03-10 11:00:00'),(12,'p6','c3','Clara Novak',5,'Extremely professional and uses great eco products. Love it.','approved','2025-04-12 08:00:00'),(13,'p6','c5','Emma Fischer',5,'Consistently excellent. Sophie is my go-to cleaner.','approved','2025-04-18 09:00:00'),(14,'p7','c2','Ben MÃ¼ller',5,'Tomas fixed a leaking pipe and repainted the kitchen. Perfect job.','approved','2025-03-28 16:00:00'),(15,'p7','c4','David Park',4,'Good work on the shelves. Took a little longer than expected.','approved','2025-04-09 14:00:00'),(16,'p8','c3','Clara Novak',5,'Yusuf drove us to the airport at 5am without complaint. Great service!','approved','2025-03-05 05:00:00'),(17,'p9','c5','Emma Fischer',5,'Nina takes such wonderful care of our dog. He comes home happy every time!','approved','2025-04-03 16:30:00'),(18,'p9','c1','Alice Weber',5,'Reliable and so gentle with our anxious rescue cat.','approved','2025-04-14 17:00:00'),(19,'p10','c2','Ben MÃ¼ller',5,'Paul helped my son go from failing to passing his maths exam. Hero!','approved','2025-03-18 16:00:00'),(20,'p10','c4','David Park',5,'Clear explanations, patient, and genuinely expert. Cannot recommend enough.','approved','2025-04-07 14:30:00'),(21,'p11','c6','Fatima Al-Hassan',5,'Rosa picked up exactly what I asked for and was super fast.','approved','2025-04-11 11:00:00'),(22,'p12','c1','Alice Weber',5,'Oliver is an incredible massage therapist. I feel brand new!','approved','2025-04-16 13:00:00'),(23,'p13','c3','Clara Novak',5,'Amira is a gift. My mother adores her. Kind, patient, and professional.','approved','2025-04-20 08:00:00'),(24,'p1','c4','David Park',4,'Nice garden work, plan to book again next month.','pending','2025-05-01 06:00:00'),(25,'p6','c6','Fatima Al-Hassan',3,'Decent cleaning but missed behind the sofa.','pending','2025-05-02 07:00:00');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_token_hash` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reporter_id` varchar(50) NOT NULL,
  `reported_type` enum('user','post','message') NOT NULL,
  `reported_id` varchar(50) NOT NULL,
  `category` enum('spam','harassment','scam_fraud','inappropriate_content','fake_profile','other') NOT NULL,
  `description` text,
  `status` enum('pending','reviewed','actioned') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reporter` (`reporter_id`),
  KEY `idx_reported` (`reported_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `description` text,
  `status` varchar(20) DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES ('S1','Cleaning','Home','ðŸ§¹','Professional home and office cleaning services.','Active'),('S10','Massage','Wellness','ðŸ’†','Relaxing therapeutic massage in the comfort of your home.','Active'),('S11','Math Tuition','Skills','ðŸ“','One-on-one maths tutoring for all ages.','Active'),('S12','IT Support','Skills','ðŸ’»','Computer help, setup, and troubleshooting.','Active'),('S2','Gardening','Home','ðŸŒ±','Garden maintenance, planting, and landscaping.','Active'),('S3','Handyman','Home','ðŸ”§','General repairs, installations, and maintenance.','Active'),('S4','Babysitting','Care','ðŸ‘¶','Trusted childcare in your home.','Active'),('S5','Elder Care','Care','ðŸ§“','Compassionate support for elderly family members.','Active'),('S6','Pet Care','Care','ðŸ•','Dog walking, pet sitting, and pet grooming.','Active'),('S7','Transport','Transport','ðŸš—','Reliable rides and errand runs.','Active'),('S8','Groceries','Transport','ðŸ›’','Grocery shopping and delivery to your door.','Active'),('S9','Cooking','Wellness','ðŸ‘¨â€ðŸ³','Home-cooked meals prepared fresh in your kitchen.','Active');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_applications`
--

DROP TABLE IF EXISTS `task_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_applications` (
  `id` varchar(50) NOT NULL,
  `task_id` varchar(50) NOT NULL,
  `provider_id` varchar(50) NOT NULL,
  `message` text,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_task` (`task_id`),
  KEY `idx_provider` (`provider_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_applications`
--

LOCK TABLES `task_applications` WRITE;
/*!40000 ALTER TABLE `task_applications` DISABLE KEYS */;
INSERT INTO `task_applications` VALUES ('ta001','tk001','p5','I have a large van and can bring a helper. Available all day on the 15th.','pending','2025-05-03 12:00:00'),('ta002','tk001','p8','Happy to help with the move. I have a 7-seater van with plenty of room.','pending','2025-05-03 13:00:00'),('ta003','tk002','p1','I can do a full garden clearance and have all the tools needed.','accepted','2025-05-01 10:00:00'),('ta004','tk003','p4','Network setup is my speciality. I can have everything running within 2 hours.','pending','2025-05-04 14:00:00'),('ta005','tk005','p11','I know the Rewe in Mitte well and can deliver same day. Reliable and punctual.','pending','2025-05-05 08:00:00'),('ta006','tk005','p8','Happy to do grocery runs. I pass through Mitte daily.','pending','2025-05-05 09:00:00'),('ta007','tk006','p10','I specialise in A-level maths. Calculus and statistics are areas I teach most.','pending','2025-05-04 16:00:00'),('ta008','tk007','p6','Post-renovation clean is exactly what I do. I will bring my full kit.','accepted','2025-05-02 12:00:00'),('ta009','tk008','p7','I have fixed parquet floors before. I can assess on the spot and repair same day.','pending','2025-05-06 10:00:00'),('ta010','tk009','p3','Thai cuisine is one of my specialities. I can prepare a full authentic menu for 8.','pending','2025-05-05 15:00:00');
/*!40000 ALTER TABLE `task_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_poster` (`poster_id`),
  KEY `idx_status` (`status`),
  KEY `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES ('tk001','c1',NULL,'Help needed moving furniture to new flat','Moving a sofa, 2 beds, and dining table from 3rd floor (no lift). Short distance, 2km.','Transport',80,'2025-05-15','Mitte, Berlin','open',52.52,13.405,'2025-05-03 07:00:00'),('tk002','c2','p1','Garden clearance after winter','Need someone to clear dead plants, rake leaves and prep raised beds for spring planting.','Gardening',60,'2025-05-12','Prenzlauer Berg, Berlin','assigned',52.537,13.414,'2025-05-01 08:00:00'),('tk003','c4',NULL,'Set up home office network','Need router configured, 2 PCs connected via ethernet and a printer on the network.','IT Support',100,'2025-05-14','Charlottenburg, Berlin','open',52.5165,13.3043,'2025-05-04 09:00:00'),('tk004','c5','p9','Dog walker needed weekday mornings for May','45-minute morning walks, Mon-Fri. Border collie, very friendly.','Pet Care',200,'2025-05-01','Kreuzberg, Berlin','assigned',52.4975,13.4008,'2025-04-28 06:00:00'),('tk005','c3',NULL,'Weekly grocery shop for elderly mum','Shop at Rewe and deliver to Mitte apartment. Usually 60-80 EUR of goods per visit.','Groceries',20,'2025-05-08','Mitte, Berlin','open',52.52,13.405,'2025-05-05 07:00:00'),('tk006','c6',NULL,'Looking for maths tutor for A-level revision','My daughter needs help with calculus and statistics. 2 sessions per week.','Math Tuition',50,'2025-05-13','Neukoelln, Berlin','open',52.475,13.425,'2025-05-04 12:00:00'),('tk007','c1','p6','Deep clean after building renovation','Dust and debris everywhere. 4-room apartment needs thorough cleaning.','Cleaning',180,'2025-05-09','Mitte, Berlin','assigned',52.5172,13.3978,'2025-05-02 10:00:00'),('tk008','c2',NULL,'Fix squeaky floorboards in living room','About 6 boards that squeak loudly. Old parquet floor.','Handyman',70,'2025-05-16','Pankow, Berlin','open',52.569,13.402,'2025-05-06 08:00:00'),('tk009','c4',NULL,'Cook authentic Thai dinner for 8 people','Need a professional cook for a dinner party. Thai cuisine preferred.','Cooking',150,'2025-05-17','Charlottenburg, Berlin','open',52.5165,13.3043,'2025-05-05 14:00:00'),('tk010','c3','p13','Companion care for my mother, twice a week','Companionship and light housekeeping for 82-year-old woman in good health.','Elder Care',80,'2025-05-06','Mitte, Berlin','assigned',52.5096,13.3762,'2025-04-30 07:00:00');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_blocks`
--

DROP TABLE IF EXISTS `user_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_blocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blocker_id` varchar(50) NOT NULL,
  `blocked_id` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_block` (`blocker_id`,`blocked_id`),
  KEY `idx_blocker` (`blocker_id`),
  KEY `idx_blocked` (`blocked_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
/*!40101 SET character_set_client = utf8 */;
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
  `rate` float DEFAULT '0',
  `street_name` varchar(100) DEFAULT NULL,
  `street_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `languages` varchar(100) DEFAULT NULL,
  `years` int(11) DEFAULT '0',
  `phone` varchar(50) DEFAULT NULL,
  `availability` text,
  `service_categories` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(255) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  `terms_accepted_at` datetime DEFAULT NULL,
  `terms_version` varchar(10) DEFAULT NULL,
  `trust_level` enum('new_user','verified_user','trusted_user') DEFAULT 'new_user',
  `trust_score` decimal(5,2) DEFAULT '0.00',
  `risk_score` decimal(5,2) DEFAULT '0.00',
  `subscription_plan` enum('free','pro') NOT NULL DEFAULT 'free',
  `featured_until` datetime DEFAULT NULL,
  `featured_category` varchar(100) DEFAULT NULL,
  `monthly_booking_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `monthly_booking_reset_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin1','HelpHub Admin','admin@helphub.com','Admin','Active',NULL,1,'Email','Platform administrator.',5,0,NULL,NULL,'Berlin','Germany',NULL,NULL,0,NULL,NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,NULL,NULL,'2025-01-01 00:00:00','1.0','trusted_user',100.00,0.00,'pro',NULL,NULL,0.00,NULL),('c1','Alice Weber','alice.weber@example.com','Customer','Active','https://i.pravatar.cc/150?u=c1',1,'Email','Love keeping my home tidy.',4.8,0,'Unter den Linden','12','Berlin','Germany','10117','English,German',0,'+49 151 1111 0001',NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,52.5172,13.3978,'2025-03-01 09:00:00','1.0','verified_user',72.00,0.00,'free',NULL,NULL,0.00,NULL),('c2','Ben MÃ¼ller','ben.mueller@example.com','Customer','Active','https://i.pravatar.cc/150?u=c2',1,'Google','Father of two, need reliable sitters.',4.5,0,'FriedrichstraÃŸe','50','Berlin','Germany','10117','German',0,'+49 151 1111 0002',NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,52.5068,13.3882,'2025-03-10 10:00:00','1.0','new_user',30.00,0.00,'free',NULL,NULL,0.00,NULL),('c3','Clara Novak','clara.novak@example.com','Customer','Active','https://i.pravatar.cc/150?u=c3',1,'Email','Need help with elderly mum.',5,0,'Potsdamer Platz','1','Berlin','Germany','10785','English,Czech',0,'+49 151 1111 0003',NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,52.5096,13.3762,'2025-02-15 08:00:00','1.0','trusted_user',90.00,0.00,'pro',NULL,NULL,0.00,NULL),('c4','David Park','david.park@example.com','Customer','Active','https://i.pravatar.cc/150?u=c4',1,'Google','Tech enthusiast, always busy.',4.2,0,'Alexanderplatz','7','Berlin','Germany','10178','English,Korean',0,'+49 151 1111 0004',NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,52.5219,13.4132,'2025-04-01 12:00:00','1.0','new_user',20.00,0.00,'free',NULL,NULL,0.00,NULL),('c5','Emma Fischer','emma.fischer@example.com','Customer','Active','https://i.pravatar.cc/150?u=c5',1,'Email','Dog owner, love my garden.',4.9,0,'KurfÃ¼rstendamm','100','Berlin','Germany','10709','German,French',0,'+49 151 1111 0005',NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,52.5027,13.33,'2025-03-20 14:00:00','1.0','verified_user',65.00,0.00,'free',NULL,NULL,0.00,NULL),('c6','Fatima Al-Hassan','fatima.hassan@example.com','Customer','Active','https://i.pravatar.cc/150?u=c6',1,'Email','New to Berlin, need support.',4.7,0,'TorstraÃŸe','35','Berlin','Germany','10119','English,Arabic',0,'+49 151 1111 0006',NULL,NULL,'2026-05-07 20:00:02',NULL,NULL,52.5289,13.4005,'2025-04-10 16:00:00','1.0','new_user',15.00,0.00,'free',NULL,NULL,0.00,NULL),('p1','Maria Schmidt','maria.schmidt@example.com','Provider','Active','https://i.pravatar.cc/150?u=p1',1,'Email','Passionate gardener with 8 years experience. I treat every garden like my own.',4.9,35,'Prenzlauer Allee','42','Berlin','Germany','10405','German,English',8,'+49 151 2222 0001','Mon-Fri 08:00-18:00','Gardening','2026-05-07 20:00:02',NULL,NULL,52.525,13.41,'2025-01-10 09:00:00','1.0','trusted_user',95.00,0.00,'pro',NULL,NULL,0.00,NULL),('p10','Dr. Paul Becker','paul.becker@example.com','Provider','Active','https://i.pravatar.cc/150?u=p10',1,'Email','PhD mathematician. Patient tutor for school, university, and adult learners.',4.9,60,'GrunewaldstraÃŸe','15','Berlin','Germany','10823','German,English',20,'+49 151 2222 0010','Afternoons & Weekends','Math Tuition','2026-05-07 20:00:02',NULL,NULL,52.508,13.385,'2025-03-05 11:00:00','1.0','trusted_user',96.00,0.00,'pro',NULL,NULL,0.00,NULL),('p11','Rosa Garcia','rosa.garcia@example.com','Provider','Active','https://i.pravatar.cc/150?u=p11',1,'Google','Fast and friendly grocery runner. I know all the best local shops.',4.7,15,'Boxhagener Str','78','Berlin','Germany','10245','Spanish,German,English',3,'+49 151 2222 0011','Mon-Sat 09:00-18:00','Groceries','2026-05-07 20:00:02',NULL,NULL,52.519,13.405,'2025-03-10 12:00:00','1.0','new_user',45.00,0.00,'free',NULL,NULL,0.00,NULL),('p12','Oliver Braun','oliver.braun@example.com','Provider','Active','https://i.pravatar.cc/150?u=p12',1,'Email','Certified massage therapist â€” sports, deep tissue, relaxation.',4.8,70,'NollendorfstraÃŸe','9','Berlin','Germany','10777','German,English',9,'+49 151 2222 0012','Tue-Sat 10:00-19:00','Massage','2026-05-07 20:00:02',NULL,NULL,52.4988,13.3539,'2025-03-15 14:00:00','1.0','verified_user',82.00,0.00,'pro',NULL,NULL,0.00,NULL),('p13','Amira Khalil','amira.khalil@example.com','Provider','Active','https://i.pravatar.cc/150?u=p13',1,'Email','Elder care specialist. Compassionate, patient, and experienced.',4.9,28,'InvalidenstraÃŸe','55','Berlin','Germany','10115','Arabic,German,English',11,'+49 151 2222 0013','Mon-Fri 08:00-18:00','Elder Care','2026-05-07 20:00:02',NULL,NULL,52.532,13.382,'2025-03-20 09:00:00','1.0','trusted_user',92.00,0.00,'pro',NULL,NULL,0.00,NULL),('p2','Lena Bauer','lena.bauer@example.com','Provider','Active','https://i.pravatar.cc/150?u=p2',1,'Google','Certified childcare worker. Safe, fun, and reliable babysitting.',4.8,25,'Kastanienallee','17','Berlin','Germany','10435','German,English',5,'+49 151 2222 0002','Evenings & Weekends','Babysitting','2026-05-07 20:00:02',NULL,NULL,52.51,13.39,'2025-01-15 10:00:00','1.0','verified_user',80.00,0.00,'free',NULL,NULL,0.00,NULL),('p3','Ahmed Hassan','ahmed.hassan@example.com','Provider','Active','https://i.pravatar.cc/150?u=p3',1,'Email','Professional chef offering home-cooked meals. Middle Eastern & Mediterranean cuisine.',4.7,45,'Skalitzer Str','88','Berlin','Germany','10997','Arabic,English,German',10,'+49 151 2222 0003','Flexible','Cooking','2026-05-07 20:00:02',NULL,NULL,52.5155,13.402,'2025-01-20 11:00:00','1.0','trusted_user',88.00,0.00,'pro',NULL,NULL,0.00,NULL),('p4','Jan Kowalski','jan.kowalski@example.com','Provider','Active','https://i.pravatar.cc/150?u=p4',1,'Email','IT specialist â€” PCs, Macs, networking. No problem too small.',4.6,50,'MÃ¼llerstraÃŸe','110','Berlin','Germany','13349','Polish,German,English',12,'+49 151 2222 0004','Mon-Sat 09:00-20:00','IT Support','2026-05-07 20:00:02',NULL,NULL,52.53,13.38,'2025-01-25 12:00:00','1.0','trusted_user',91.00,0.00,'pro',NULL,NULL,0.00,NULL),('p5','Klaus Richter','klaus.richter@example.com','Provider','Active','https://i.pravatar.cc/150?u=p5',1,'Email','Experienced mover. I handle your belongings with care.',4.5,40,'Sonnenallee','66','Berlin','Germany','12045','German',7,'+49 151 2222 0005','Weekends','Transport','2026-05-07 20:00:02',NULL,NULL,52.5,13.42,'2025-02-01 09:00:00','1.0','verified_user',70.00,0.00,'free',NULL,NULL,0.00,NULL),('p6','Sophie Lefebvre','sophie.lefebvre@example.com','Provider','Active','https://i.pravatar.cc/150?u=p6',1,'Google','Thorough and trustworthy cleaner. I bring my own eco-friendly supplies.',4.9,30,'BergmannstraÃŸe','22','Berlin','Germany','10961','French,German,English',6,'+49 151 2222 0006','Mon-Fri 07:00-15:00','Cleaning','2026-05-07 20:00:02',NULL,NULL,52.518,13.425,'2025-02-05 10:00:00','1.0','trusted_user',93.00,0.00,'pro',NULL,NULL,0.00,NULL),('p7','Tomas Novotny','tomas.novotny@example.com','Provider','Active','https://i.pravatar.cc/150?u=p7',1,'Email','Skilled handyman: plumbing, electrics, painting. 15 years on the tools.',4.7,55,'WeserstraÃŸe','5','Berlin','Germany','12047','Czech,German,English',15,'+49 151 2222 0007','Mon-Fri 08:00-17:00','Handyman','2026-05-07 20:00:02',NULL,NULL,52.507,13.415,'2025-02-10 08:00:00','1.0','trusted_user',87.00,0.00,'pro',NULL,NULL,0.00,NULL),('p8','Yusuf Demir','yusuf.demir@example.com','Provider','Active','https://i.pravatar.cc/150?u=p8',1,'Email','Driver with clean record and large van. Airport runs, moving, errands.',4.6,30,'HermannstraÃŸe','200','Berlin','Germany','12049','Turkish,German,English',9,'+49 151 2222 0008','Daily 06:00-22:00','Transport,Groceries','2026-05-07 20:00:02',NULL,NULL,52.522,13.395,'2025-02-15 09:00:00','1.0','verified_user',75.00,0.00,'free',NULL,NULL,0.00,NULL),('p9','Nina Wolf','nina.wolf@example.com','Provider','Active','https://i.pravatar.cc/150?u=p9',1,'Google','Animal lover â€” dog walking, pet sitting, basic grooming. Insured.',4.8,20,'Rosenthaler Str','40','Berlin','Germany','10178','German,English',4,'+49 151 2222 0009','Daily 07:00-19:00','Pet Care','2026-05-07 20:00:02',NULL,NULL,52.513,13.43,'2025-03-01 10:00:00','1.0','verified_user',78.00,0.00,'free',NULL,NULL,0.00,NULL);
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

-- Dump completed on 2026-05-07 22:04:34
