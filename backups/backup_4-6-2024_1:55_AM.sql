-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: booksLibrary
-- ------------------------------------------------------
-- Server version	8.0.36-0ubuntu0.22.04.1

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
-- Current Database: `booksLibrary`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `booksLibrary` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `booksLibrary`;

--
-- Table structure for table `authors`
--

DROP TABLE IF EXISTS `authors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authors` (
  `authorIDs` int NOT NULL AUTO_INCREMENT,
  `authors` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`authorIDs`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authors`
--

LOCK TABLES `authors` WRITE;
/*!40000 ALTER TABLE `authors` DISABLE KEYS */;
INSERT INTO `authors` VALUES (1,'Андрей Богуславский'),(2,'Марк Саммерфильд'),(3,'М. Вильямс'),(4,'Уэс Маккинни'),(5,'Брюс Эккель'),(6,'Томас Кормен'),(7,'Чарльз Лейзерсон'),(8,'Рональд Ривест'),(9,'Клиффорд Штайн'),(10,'Дэвид Флэнаган'),(11,'Гэри Маклин Холл'),(12,'Джеймс Р. Грофф'),(13,'Люк Веллинг'),(14,'Сергей Мастицкий'),(15,'Джон Вудкок'),(16,'Джереми Блум'),(17,'А. Белов'),(18,'Сэмюэл Грингард'),(19,'Сет Гринберг'),(20,'Александр Сераков'),(21,'Тим Кедлек'),(22,'Пол Дейтел'),(23,'Харви Дейтел'),(24,'Роберт Мартин'),(25,'Энтони Грей'),(26,'Мартин Фаулер'),(27,'Прамодкумар Дж. Садаладж'),(28,'Джей Макгаврен'),(29,'Дрю Нейл'),(30,'Roman Shamarin'),(31,'Olena'),(32,'Roma'),(33,'Sasha');
/*!40000 ALTER TABLE `authors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `authors_and_books`
--

DROP TABLE IF EXISTS `authors_and_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `authors_and_books` (
  `author_and_book_IDs` int NOT NULL AUTO_INCREMENT,
  `authorIDs` int NOT NULL,
  `bookIDs` int NOT NULL,
  PRIMARY KEY (`author_and_book_IDs`),
  KEY `authorIDs` (`authorIDs`),
  KEY `bookIDs` (`bookIDs`),
  CONSTRAINT `authorIDs` FOREIGN KEY (`authorIDs`) REFERENCES `authors` (`authorIDs`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bookIDs` FOREIGN KEY (`bookIDs`) REFERENCES `books` (`bookIDs`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `authors_and_books`
--

LOCK TABLES `authors_and_books` WRITE;
/*!40000 ALTER TABLE `authors_and_books` DISABLE KEYS */;
INSERT INTO `authors_and_books` VALUES (1,1,1),(2,2,2),(3,3,3),(4,4,4),(5,5,5),(6,6,6),(7,7,6),(8,8,6),(9,9,6),(10,10,7),(11,11,8),(12,12,9),(13,13,10),(14,14,11),(15,15,12),(16,16,13),(17,17,14),(18,18,15),(19,19,16),(20,20,17),(21,21,18),(22,22,19),(23,23,19),(24,24,20),(25,25,21),(26,26,22),(27,27,22),(28,28,23),(29,29,24),(30,30,25),(31,31,26),(32,32,26),(33,33,26);
/*!40000 ALTER TABLE `authors_and_books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `bookIDs` int NOT NULL AUTO_INCREMENT,
  `title` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `visits` int NOT NULL DEFAULT '0',
  `purchases` int NOT NULL DEFAULT '0',
  `action` tinyint(1) NOT NULL DEFAULT '0',
  `filePath` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`bookIDs`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'СИ++ И КОМПЬЮТЕРНАЯ ГРАФИКА',76,2,0,NULL),(2,'Программирование на языке Go!',14,1,0,NULL),(3,'Толковый словарь сетевых терминов и аббревиатур',5,0,0,NULL),(4,'Python for Data Analysis',0,0,0,NULL),(5,'Thinking in Java (4th Edition)',1,1,0,NULL),(6,'Introduction to Algorithms',0,0,0,NULL),(7,'JavaScript Pocket Reference',0,0,0,NULL),(8,'Adaptive Code via C#: Class and Interface Design, Design Patterns, and SOLID Principles',1,0,0,NULL),(9,'SQL: The Complete Referenc',0,0,0,NULL),(10,'PHP and MySQL Web Development',0,0,0,NULL),(11,'Статистический анализ и визуализация данных с помощью R',0,0,0,NULL),(12,'Computer Coding for Kid',0,0,0,NULL),(13,'Exploring Arduino: Tools and Techniques for Engineering Wizardry',0,0,0,NULL),(14,'Программирование микроконтроллеров для начинающих и не только',0,0,0,NULL),(15,'The Internet of Things ',0,0,0,NULL),(16,'Sketching User Experiences: The Workbook',0,0,0,NULL),(17,'InDesign CS6',0,0,0,NULL),(18,'Адаптивный дизайн. Делаем сайты для любых устройств',0,0,0,NULL),(19,'Android для разработчиков',0,0,0,NULL),(20,'Clean Code: A Handbook of Agile Software Craftsmanship',1,0,0,NULL),(21,'Swift Pocket Reference: Programming for iOS and OS X',0,0,0,NULL),(22,'NoSQL Distilled: A Brief Guide to the Emerging World of Polyglot Persistence',0,0,0,NULL),(23,'Head First Ruby',0,0,0,NULL),(24,'Practical Vim',0,0,0,NULL),(25,'My new Book',2,3,0,NULL),(26,'Review book',0,0,0,NULL);
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logins_and_passwords`
--

DROP TABLE IF EXISTS `logins_and_passwords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logins_and_passwords` (
  `logins` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `passwords` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logins_and_passwords`
--

LOCK TABLES `logins_and_passwords` WRITE;
/*!40000 ALTER TABLE `logins_and_passwords` DISABLE KEYS */;
INSERT INTO `logins_and_passwords` VALUES ('admin','$2b$11$.wo6sPavPcpkpUuFuci8T.Mmv2Xl8SvpwdlUVAxVX55DCXjkJQO1q');
/*!40000 ALTER TABLE `logins_and_passwords` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-06  1:55:05
