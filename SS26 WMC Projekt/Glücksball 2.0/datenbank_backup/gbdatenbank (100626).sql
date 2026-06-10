-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 10. Jun 2026 um 20:32
-- Server-Version: 10.4.32-MariaDB
-- PHP-Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Datenbank: `gbdatenbank`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `forum_messages`
--

CREATE TABLE `forum_messages` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `forum_messages`
--

INSERT INTO `forum_messages` (`id`, `user_id`, `message`, `created_at`) VALUES
(1, 6, 'Willkommen', '2026-05-25 23:55:36'),
(2, 7, 'Na servus ist das leiwand', '2026-05-27 14:44:15'),
(3, 7, 'WOWOOWOW', '2026-05-27 14:44:18'),
(16, 6, 'Ich werde champion del mundo', '2026-06-10 14:32:13');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `account_type` enum('user','pending') NOT NULL,
  `account_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `password_resets`
--

INSERT INTO `password_resets` (`id`, `account_type`, `account_id`, `email`, `token_hash`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 'user', 9, 'fahd.wow@live.at', 'b51e43da275b35067d9c4e7209138572bce73e8d19b9cb65a07469932830d0a1', '2026-06-10 21:13:06', '2026-06-10 20:13:08', '2026-06-10 20:13:06'),
(2, 'user', 9, 'fahd.wow@live.at', 'da12d27d3684a459ac9d5bf6589791f81e34762b37b184068b90ddc78d085706', '2026-06-10 21:13:08', '2026-06-10 20:13:10', '2026-06-10 20:13:08'),
(3, 'user', 9, 'fahd.wow@live.at', 'd147fdefe59a56bde33c2b6b6967606bb7d44d37ba4a9e12895d624bfd4a4951', '2026-06-10 21:13:10', '2026-06-10 20:13:12', '2026-06-10 20:13:10'),
(4, 'user', 9, 'fahd.wow@live.at', '3e6c81ec103fe10dd65e27153d61314219143af6e67f3fdc7cf8e72f404f6789', '2026-06-10 21:13:12', '2026-06-10 20:18:41', '2026-06-10 20:13:12'),
(5, 'user', 6, 'ad@ad.ad', 'b7ad0bb511eba13bd5cb3d9d23ae2e93389026b4dfb65a59d3c22dc00bf64d0e', '2026-06-10 21:17:02', '2026-06-10 20:17:51', '2026-06-10 20:17:02'),
(6, 'user', 6, 'ad@ad.ad', '823a860fd3d3572906b0a01a019d37a97017a4511a22b405d7b862d6769f69b5', '2026-06-10 21:17:51', '2026-06-10 20:27:47', '2026-06-10 20:17:51'),
(7, 'user', 9, 'fahd.wow@live.at', '8775b5c504ddaa6f1d214d4f9be8408396c6727f1341d4d567b072bbbfc1df66', '2026-06-10 21:18:41', NULL, '2026-06-10 20:18:41'),
(8, 'user', 6, 'ad@ad.ad', 'fba569ef4960d2a2764be6b8941ae6b0165b7b50b36a5c256c256c7bc21694e5', '2026-06-10 21:27:47', NULL, '2026-06-10 20:27:47');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `pending_users`
--

CREATE TABLE `pending_users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `spiele`
--

CREATE TABLE `spiele` (
  `id` int(11) NOT NULL,
  `match_id` varchar(50) DEFAULT NULL,
  `competition` varchar(100) DEFAULT '',
  `group_name` varchar(255) DEFAULT NULL,
  `team_home` varchar(100) DEFAULT NULL,
  `team_away` varchar(100) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `score_home` int(11) DEFAULT NULL,
  `score_away` int(11) DEFAULT NULL,
  `status` enum('upcoming','finished') DEFAULT 'upcoming',
  `url` text DEFAULT NULL,
  `aktiv` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `spiele`
--

INSERT INTO `spiele` (`id`, `match_id`, `competition`, `group_name`, `team_home`, `team_away`, `date`, `score_home`, `score_away`, `status`, `url`, `aktiv`) VALUES
(5311, 'WC2026-M01', 'WM 2026', 'Group A', 'Mexico', 'South Africa', '2026-06-11 21:00:00', NULL, NULL, 'upcoming', 'Estadio Azteca, Mexico City', 1),
(5312, 'WC2026-M02', 'WM 2026', 'Group A', 'South Korea', 'Czech Republic', '2026-06-12 04:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Zapopan', 1),
(5313, 'WC2026-M03', 'WM 2026', 'Group B', 'Canada', 'Bosnia and Herzegovina', '2026-06-12 21:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5314, 'WC2026-M04', 'WM 2026', 'Group D', 'United States', 'Paraguay', '2026-06-13 03:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Inglewood', 1),
(5315, 'WC2026-M05', 'WM 2026', 'Group C', 'Haiti', 'Scotland', '2026-06-14 03:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Foxborough', 1),
(5316, 'WC2026-M06', 'WM 2026', 'Group D', 'Australia', 'Turkey', '2026-06-14 06:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5317, 'WC2026-M07', 'WM 2026', 'Group C', 'Brazil', 'Morocco', '2026-06-14 00:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, East Rutherford', 1),
(5318, 'WC2026-M08', 'WM 2026', 'Group B', 'Qatar', 'Switzerland', '2026-06-13 21:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, Santa Clara', 1),
(5319, 'WC2026-M09', 'WM 2026', 'Group E', 'Ivory Coast', 'Ecuador', '2026-06-15 01:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5320, 'WC2026-M10', 'WM 2026', 'Group E', 'Germany', 'Curacao', '2026-06-14 19:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5321, 'WC2026-M11', 'WM 2026', 'Group F', 'Netherlands', 'Japan', '2026-06-14 22:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Arlington', 1),
(5322, 'WC2026-M12', 'WM 2026', 'Group F', 'Sweden', 'Tunisia', '2026-06-15 04:00:00', NULL, NULL, 'upcoming', 'Estadio BBVA, Guadalupe', 1),
(5323, 'WC2026-M13', 'WM 2026', 'Group H', 'Saudi Arabia', 'Uruguay', '2026-06-16 00:00:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami Gardens', 1),
(5324, 'WC2026-M14', 'WM 2026', 'Group H', 'Spain', 'Cape Verde', '2026-06-15 18:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5325, 'WC2026-M15', 'WM 2026', 'Group G', 'Iran', 'New Zealand', '2026-06-16 03:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Inglewood', 1),
(5326, 'WC2026-M16', 'WM 2026', 'Group G', 'Belgium', 'Egypt', '2026-06-15 21:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5327, 'WC2026-M17', 'WM 2026', 'Group I', 'France', 'Senegal', '2026-06-16 21:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, East Rutherford', 1),
(5328, 'WC2026-M18', 'WM 2026', 'Group I', 'Iraq', 'Norway', '2026-06-17 00:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Foxborough', 1),
(5329, 'WC2026-M19', 'WM 2026', 'Group J', 'Argentina', 'Algeria', '2026-06-17 03:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5330, 'WC2026-M20', 'WM 2026', 'Group J', 'Austria', 'Jordan', '2026-06-17 06:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, Santa Clara', 1),
(5331, 'WC2026-M21', 'WM 2026', 'Group L', 'Ghana', 'Panama', '2026-06-18 01:00:00', NULL, NULL, 'upcoming', 'Toronto Stadium, Toronto', 1),
(5332, 'WC2026-M22', 'WM 2026', 'Group L', 'England', 'Croatia', '2026-06-17 22:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Arlington', 1),
(5333, 'WC2026-M23', 'WM 2026', 'Group K', 'Portugal', 'DR Congo', '2026-06-17 19:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5334, 'WC2026-M24', 'WM 2026', 'Group K', 'Uzbekistan', 'Colombia', '2026-06-18 04:00:00', NULL, NULL, 'upcoming', 'Estadio Azteca, Mexico City', 1),
(5335, 'WC2026-M25', 'WM 2026', 'Group A', 'Czech Republic', 'South Africa', '2026-06-18 18:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5336, 'WC2026-M26', 'WM 2026', 'Group B', 'Switzerland', 'Bosnia and Herzegovina', '2026-06-18 21:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Inglewood', 1),
(5337, 'WC2026-M27', 'WM 2026', 'Group B', 'Canada', 'Qatar', '2026-06-19 00:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5338, 'WC2026-M28', 'WM 2026', 'Group A', 'Mexico', 'South Korea', '2026-06-19 03:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Zapopan', 1),
(5339, 'WC2026-M29', 'WM 2026', 'Group C', 'Brazil', 'Haiti', '2026-06-20 02:30:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5340, 'WC2026-M30', 'WM 2026', 'Group C', 'Scotland', 'Morocco', '2026-06-20 00:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Foxborough', 1),
(5341, 'WC2026-M31', 'WM 2026', 'Group D', 'Turkey', 'Paraguay', '2026-06-20 05:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, Santa Clara', 1),
(5342, 'WC2026-M32', 'WM 2026', 'Group D', 'United States', 'Australia', '2026-06-19 21:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5343, 'WC2026-M33', 'WM 2026', 'Group E', 'Germany', 'Ivory Coast', '2026-06-20 22:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5344, 'WC2026-M34', 'WM 2026', 'Group E', 'Ecuador', 'Curacao', '2026-06-21 02:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5345, 'WC2026-M35', 'WM 2026', 'Group F', 'Netherlands', 'Sweden', '2026-06-20 19:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5346, 'WC2026-M36', 'WM 2026', 'Group F', 'Tunisia', 'Japan', '2026-06-21 06:00:00', NULL, NULL, 'upcoming', 'Estadio BBVA, Guadalupe', 1),
(5347, 'WC2026-M37', 'WM 2026', 'Group H', 'Uruguay', 'Cape Verde', '2026-06-22 00:00:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami Gardens', 1),
(5348, 'WC2026-M38', 'WM 2026', 'Group H', 'Spain', 'Saudi Arabia', '2026-06-21 18:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5349, 'WC2026-M39', 'WM 2026', 'Group G', 'Belgium', 'Iran', '2026-06-21 21:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Inglewood', 1),
(5350, 'WC2026-M40', 'WM 2026', 'Group G', 'New Zealand', 'Egypt', '2026-06-22 03:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5351, 'WC2026-M41', 'WM 2026', 'Group I', 'Norway', 'Senegal', '2026-06-23 02:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, East Rutherford', 1),
(5352, 'WC2026-M42', 'WM 2026', 'Group I', 'France', 'Iraq', '2026-06-22 23:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5353, 'WC2026-M43', 'WM 2026', 'Group J', 'Argentina', 'Austria', '2026-06-22 19:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Arlington', 1),
(5354, 'WC2026-M44', 'WM 2026', 'Group J', 'Jordan', 'Algeria', '2026-06-23 05:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, Santa Clara', 1),
(5355, 'WC2026-M45', 'WM 2026', 'Group L', 'England', 'Ghana', '2026-06-23 22:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Foxborough', 1),
(5356, 'WC2026-M46', 'WM 2026', 'Group L', 'Panama', 'Croatia', '2026-06-24 01:00:00', NULL, NULL, 'upcoming', 'Toronto Stadium, Toronto', 1),
(5357, 'WC2026-M47', 'WM 2026', 'Group K', 'Portugal', 'Uzbekistan', '2026-06-23 19:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5358, 'WC2026-M48', 'WM 2026', 'Group K', 'Colombia', 'DR Congo', '2026-06-24 04:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Zapopan', 1),
(5359, 'WC2026-M49', 'WM 2026', 'Group C', 'Scotland', 'Brazil', '2026-06-25 00:00:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami Gardens', 1),
(5360, 'WC2026-M50', 'WM 2026', 'Group C', 'Morocco', 'Haiti', '2026-06-25 00:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5361, 'WC2026-M51', 'WM 2026', 'Group B', 'Switzerland', 'Canada', '2026-06-24 21:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5362, 'WC2026-M52', 'WM 2026', 'Group B', 'Bosnia and Herzegovina', 'Qatar', '2026-06-24 21:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5363, 'WC2026-M53', 'WM 2026', 'Group A', 'Czech Republic', 'Mexico', '2026-06-25 03:00:00', NULL, NULL, 'upcoming', 'Estadio Azteca, Mexico City', 1),
(5364, 'WC2026-M54', 'WM 2026', 'Group A', 'South Africa', 'South Korea', '2026-06-25 03:00:00', NULL, NULL, 'upcoming', 'Estadio BBVA, Guadalupe', 1),
(5365, 'WC2026-M55', 'WM 2026', 'Group E', 'Curacao', 'Ivory Coast', '2026-06-25 22:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5366, 'WC2026-M56', 'WM 2026', 'Group E', 'Ecuador', 'Germany', '2026-06-25 22:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, East Rutherford', 1),
(5367, 'WC2026-M57', 'WM 2026', 'Group F', 'Japan', 'Sweden', '2026-06-26 01:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Arlington', 1),
(5368, 'WC2026-M58', 'WM 2026', 'Group F', 'Tunisia', 'Netherlands', '2026-06-26 01:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5369, 'WC2026-M59', 'WM 2026', 'Group D', 'Turkey', 'United States', '2026-06-26 04:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Inglewood', 1),
(5370, 'WC2026-M60', 'WM 2026', 'Group D', 'Paraguay', 'Australia', '2026-06-26 04:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, Santa Clara', 1),
(5371, 'WC2026-M61', 'WM 2026', 'Group I', 'Norway', 'France', '2026-06-26 21:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Foxborough', 1),
(5372, 'WC2026-M62', 'WM 2026', 'Group I', 'Senegal', 'Iraq', '2026-06-26 21:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5373, 'WC2026-M63', 'WM 2026', 'Group G', 'Egypt', 'Iran', '2026-06-27 05:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5374, 'WC2026-M64', 'WM 2026', 'Group G', 'New Zealand', 'Belgium', '2026-06-27 05:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5375, 'WC2026-M65', 'WM 2026', 'Group H', 'Cape Verde', 'Saudi Arabia', '2026-06-27 02:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5376, 'WC2026-M66', 'WM 2026', 'Group H', 'Uruguay', 'Spain', '2026-06-27 02:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Zapopan', 1),
(5377, 'WC2026-M67', 'WM 2026', 'Group L', 'Panama', 'England', '2026-06-27 23:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, East Rutherford', 1),
(5378, 'WC2026-M68', 'WM 2026', 'Group L', 'Croatia', 'Ghana', '2026-06-27 23:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5379, 'WC2026-M69', 'WM 2026', 'Group J', 'Algeria', 'Austria', '2026-06-28 04:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5380, 'WC2026-M70', 'WM 2026', 'Group J', 'Jordan', 'Argentina', '2026-06-28 04:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Arlington', 1),
(5381, 'WC2026-M71', 'WM 2026', 'Group K', 'Colombia', 'Portugal', '2026-06-28 01:30:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami Gardens', 1),
(5382, 'WC2026-M72', 'WM 2026', 'Group K', 'DR Congo', 'Uzbekistan', '2026-06-28 01:30:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5383, 'FRI-2026-0601-TUN-AUT', 'Freundschaftsspiel', 'Spaßtipp', 'Tunesien', 'Österreich', '2026-06-01 20:45:00', 0, 1, 'upcoming', 'TBD', 0),
(5385, 'FRI-2026-0601-TUR-MKD', 'Freundschaftsspiel', 'Spaßtipp', 'Türkei', 'Nordmazedonien', '2026-06-01 18:30:00', 4, 0, 'upcoming', 'TBD', 0),
(5386, 'FRI-2026-0601-NOR-SWE', 'Freundschaftsspiel', 'Spaßtipp', 'Norwegen', 'Schweden', '2026-06-01 19:00:00', 3, 1, 'upcoming', 'TBD', 0),
(5387, 'FRI-2026-0602-CRO-BEL', 'Freundschaftsspiel', 'Spaßtipp', 'Kroatien', 'Belgien', '2026-06-02 18:00:00', 0, 2, 'upcoming', 'TBD', 0),
(5388, 'FRI-2026-0602-WAL-GHA', 'Freundschaftsspiel', 'Spaßtipp', 'Wales', 'Ghana', '2026-06-02 20:45:00', 1, 1, 'upcoming', 'TBD', 0),
(5390, 'FRI-2026-0603-LUX-ITA', 'Freundschaftsspiel', 'Spaßtipp', 'Luxemburg', 'Italien', '2026-06-03 20:45:00', 0, 1, 'upcoming', 'TBD', 0),
(5391, 'FRI-2026-0603-NED-ALG', 'Freundschaftsspiel', 'Spaßtipp', 'Niederlande', 'Algerien', '2026-06-03 20:45:00', 0, 1, 'upcoming', 'TBD', 0),
(5392, 'FRI-2026-0603-POL-NGA', 'Freundschaftsspiel', 'Spaßtipp', 'Polen', 'Nigeria', '2026-06-03 20:45:00', 2, 2, 'upcoming', 'TBD', 0),
(5393, 'FRI-2026-0604-SWE-GRE', 'Freundschaftsspiel', 'Spaßtipp', 'Schweden', 'Griechenland', '2026-06-04 19:00:00', 2, 2, 'upcoming', 'TBD', 0),
(5394, 'FRI-2026-0604-ESP-IRQ', 'Freundschaftsspiel', 'Spaßtipp', 'Spanien', 'Irak', '2026-06-04 21:00:00', 1, 1, 'upcoming', 'TBD', 0),
(5395, 'FRI-2026-0606-BEL-TUN', 'Freundschaftsspiel', 'Spaßtipp', 'Belgien', 'Tunesien', '2026-06-06 15:00:00', 5, 0, 'upcoming', 'TBD', 0),
(5396, 'FRI-2026-0606-POR-CHI', 'Freundschaftsspiel', 'Spaßtipp', 'Portugal', 'Chile', '2026-06-06 19:45:00', 2, 1, 'upcoming', 'TBD', 0),
(5397, 'FRI-2026-0606-USA-GER', 'Freundschaftsspiel', 'Spaßtipp', 'USA', 'Deutschland', '2026-06-06 20:30:00', 1, 2, 'upcoming', 'TBD', 0),
(5398, 'FRI-2026-0606-BRA-EGY', 'Freundschaftsspiel', 'Spaßtipp', 'Brasilien', 'Ägypten', '2026-06-06 22:00:00', 2, 1, 'upcoming', 'TBD', 0),
(5399, 'FRI-2026-0606-ENG-NZL', 'Freundschaftsspiel', 'Spaßtipp', 'England', 'Neuseeland', '2026-06-06 22:00:00', 1, 0, 'upcoming', 'TBD', 0),
(5400, 'FRI-2026-0607-ARG-HON', 'Freundschaftsspiel', 'Spaßtipp', 'Argentinien', 'Honduras', '2026-06-07 02:00:00', 2, 0, 'upcoming', 'TBD', 0),
(5401, 'FRI-2026-0607-MAR-NOR', 'Freundschaftsspiel', 'Spaßtipp', 'Marokko', 'Norwegen', '2026-06-07 21:00:00', 1, 1, 'upcoming', 'TBD', 0),
(5402, 'FRI-2026-0608-FRA-NIR', 'Freundschaftsspiel', 'Spaßtipp', 'Frankreich', 'Nordirland', '2026-06-08 21:10:00', 3, 1, 'upcoming', 'TBD', 0),
(5410, 'WC2026-M73', 'WM 2026', 'Sechzehntelfinale', '2. Gruppe A', '2. Gruppe B', '2026-06-28 21:00:00', NULL, NULL, 'upcoming', 'Los Angeles', 1),
(5411, 'WC2026-M74', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe E', '3. A/B/C/D/F', '2026-06-29 22:30:00', NULL, NULL, 'upcoming', 'Boston', 1),
(5412, 'WC2026-M75', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe F', '2. Gruppe C', '2026-06-30 03:00:00', NULL, NULL, 'upcoming', 'Monterrey', 1),
(5413, 'WC2026-M76', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe C', '2. Gruppe F', '2026-06-29 19:00:00', NULL, NULL, 'upcoming', 'Houston', 1),
(5414, 'WC2026-M77', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe I', '3. C/D/F/G/H', '2026-06-30 23:00:00', NULL, NULL, 'upcoming', 'NY/New Jersey', 1),
(5415, 'WC2026-M78', 'WM 2026', 'Sechzehntelfinale', '2. Gruppe E', '2. Gruppe I', '2026-06-30 19:00:00', NULL, NULL, 'upcoming', 'Dallas', 1),
(5416, 'WC2026-M79', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe A', '3. C/E/F/H/I', '2026-07-01 02:00:00', NULL, NULL, 'upcoming', 'Mexico-Stadt', 1),
(5417, 'WC2026-M80', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe L', '3. E/H/I/J/K', '2026-07-01 18:00:00', NULL, NULL, 'upcoming', 'Atlanta', 1),
(5418, 'WC2026-M81', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe D', '3. B/E/F/I/J', '2026-07-02 02:00:00', NULL, NULL, 'upcoming', 'San Francisco', 1),
(5419, 'WC2026-M82', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe G', '3. A/E/H/I/J', '2026-07-01 22:00:00', NULL, NULL, 'upcoming', 'Seattle', 1),
(5420, 'WC2026-M83', 'WM 2026', 'Sechzehntelfinale', '2. Gruppe K', '2. Gruppe L', '2026-07-03 01:00:00', NULL, NULL, 'upcoming', 'Toronto', 1),
(5421, 'WC2026-M84', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe H', '2. Gruppe J', '2026-07-02 21:00:00', NULL, NULL, 'upcoming', 'Los Angeles', 1),
(5422, 'WC2026-M85', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe B', '3. E/F/G/I/J', '2026-07-03 05:00:00', NULL, NULL, 'upcoming', 'Vancouver', 1),
(5423, 'WC2026-M86', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe J', '2. Gruppe H', '2026-07-04 00:00:00', NULL, NULL, 'upcoming', 'Miami', 1),
(5424, 'WC2026-M87', 'WM 2026', 'Sechzehntelfinale', '1. Gruppe K', '3. D/E/I/J/L', '2026-07-04 03:30:00', NULL, NULL, 'upcoming', 'Kansas City', 1),
(5425, 'WC2026-M88', 'WM 2026', 'Sechzehntelfinale', '2. Gruppe D', '2. Gruppe G', '2026-07-03 20:00:00', NULL, NULL, 'upcoming', 'Dallas', 1),
(5426, 'WC2026-M89', 'WM 2026', 'Achtelfinale', 'Sieger 74', 'Sieger 77', '2026-07-04 23:00:00', NULL, NULL, 'upcoming', 'Philadelphia', 1),
(5427, 'WC2026-M90', 'WM 2026', 'Achtelfinale', 'Sieger 73', 'Sieger 75', '2026-07-04 19:00:00', NULL, NULL, 'upcoming', 'Houston', 1),
(5428, 'WC2026-M91', 'WM 2026', 'Achtelfinale', 'Sieger 76', 'Sieger 78', '2026-07-05 22:00:00', NULL, NULL, 'upcoming', 'NY/New Jersey', 1),
(5429, 'WC2026-M92', 'WM 2026', 'Achtelfinale', 'Sieger 79', 'Sieger 80', '2026-07-06 02:00:00', NULL, NULL, 'upcoming', 'Mexico-Stadt', 1),
(5430, 'WC2026-M93', 'WM 2026', 'Achtelfinale', 'Sieger 83', 'Sieger 84', '2026-07-06 21:00:00', NULL, NULL, 'upcoming', 'Dallas', 1),
(5431, 'WC2026-M94', 'WM 2026', 'Achtelfinale', 'Sieger 81', 'Sieger 82', '2026-07-07 02:00:00', NULL, NULL, 'upcoming', 'Seattle', 1),
(5432, 'WC2026-M95', 'WM 2026', 'Achtelfinale', 'Sieger 86', 'Sieger 88', '2026-07-07 18:00:00', NULL, NULL, 'upcoming', 'Atlanta', 1),
(5433, 'WC2026-M96', 'WM 2026', 'Achtelfinale', 'Sieger 85', 'Sieger 87', '2026-07-07 22:00:00', NULL, NULL, 'upcoming', 'Vancouver', 1),
(5434, 'WC2026-M97', 'WM 2026', 'Viertelfinale', 'Sieger 89', 'Sieger 90', '2026-07-09 22:00:00', NULL, NULL, 'upcoming', 'Boston', 1),
(5435, 'WC2026-M98', 'WM 2026', 'Viertelfinale', 'Sieger 93', 'Sieger 94', '2026-07-10 21:00:00', NULL, NULL, 'upcoming', 'Los Angeles', 1),
(5436, 'WC2026-M99', 'WM 2026', 'Viertelfinale', 'Sieger 91', 'Sieger 92', '2026-07-11 23:00:00', NULL, NULL, 'upcoming', 'Miami', 1),
(5437, 'WC2026-M100', 'WM 2026', 'Viertelfinale', 'Sieger 95', 'Sieger 96', '2026-07-12 03:00:00', NULL, NULL, 'upcoming', 'Kansas City', 1),
(5438, 'WC2026-M101', 'WM 2026', 'Halbfinale', 'Sieger 97', 'Sieger 98', '2026-07-14 21:00:00', NULL, NULL, 'upcoming', 'Dallas', 1),
(5439, 'WC2026-M102', 'WM 2026', 'Halbfinale', 'Sieger 99', 'Sieger 100', '2026-07-15 21:00:00', NULL, NULL, 'upcoming', 'Atlanta', 1),
(5440, 'WC2026-M103', 'WM 2026', 'Spiel um Platz 3', 'Verlierer 101', 'Verlierer 102', '2026-07-18 23:00:00', NULL, NULL, 'upcoming', 'Miami', 1),
(5441, 'WC2026-M104', 'WM 2026', 'Finale', 'Sieger 101', 'Sieger 102', '2026-07-19 21:00:00', NULL, NULL, 'upcoming', 'NY/New Jersey', 1),
(5442, 'FRI-2026-0610-AUT-CZE', 'Freundschaftsspiel', 'Freundschaftsspiel', 'Austria', 'Czech Republic', '2026-06-10 23:00:00', NULL, NULL, 'upcoming', 'Ernst-Happel-Stadion, Wien', 0),
(5443, 'FRI-2026-0611-GER-SUI', 'Freundschaftsspiel', 'Freundschaftsspiel', 'Germany', 'Switzerland', '2026-06-11 18:00:00', NULL, NULL, 'upcoming', 'Vorbereitungsspiel', 0),
(5444, 'FRI-2026-0612-FRA-MAR', 'Freundschaftsspiel', 'Freundschaftsspiel', 'France', 'Morocco', '2026-06-12 18:00:00', NULL, NULL, 'upcoming', 'Vorbereitungsspiel', 0),
(5445, 'FRI-2026-0613-ESP-POR', 'Freundschaftsspiel', 'Freundschaftsspiel', 'Spain', 'Portugal', '2026-06-13 18:00:00', NULL, NULL, 'upcoming', 'Vorbereitungsspiel', 0),
(5446, 'FRI-2026-0614-ARG-URU', 'Freundschaftsspiel', 'Freundschaftsspiel', 'Argentina', 'Uruguay', '2026-06-14 18:00:00', NULL, NULL, 'upcoming', 'Vorbereitungsspiel', 0),
(5447, 'FRI-2026-0615-AUT-NOR', 'Freundschaftsspiel', 'Freundschaftsspiel', 'Austria', 'Norway', '2026-06-15 20:45:00', NULL, NULL, 'upcoming', 'Vorbereitungsspiel', 0),
(5448, 'FRI-2026-0610-PAK-AFG', 'Freundschaftsspiel', 'Männer-Freundschaftsspiel', 'Pakistan', 'Afghanistan', '2026-06-10 18:00:00', NULL, NULL, 'upcoming', 'Männer-Nationalteams', 1),
(5449, 'FRI-2026-0610-POR-NGA', 'Freundschaftsspiel', 'Männer-Freundschaftsspiel', 'Portugal', 'Nigeria', '2026-06-10 21:45:00', NULL, NULL, 'upcoming', 'Männer-Nationalteams', 1),
(5450, 'FRI-2026-0610-ENG-CRC', 'Freundschaftsspiel', 'Männer-Freundschaftsspiel', 'England', 'Costa Rica', '2026-06-10 22:00:00', NULL, NULL, 'upcoming', 'Männer-Nationalteams', 1),
(5451, 'FRI-2026-0611-BOL-DZA', 'Freundschaftsspiel', 'Männer-Freundschaftsspiel', 'Bolivia', 'Algeria', '2026-06-11 02:00:00', NULL, NULL, 'upcoming', 'Männer-Nationalteams', 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `tipps`
--

CREATE TABLE `tipps` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `spiel_id` int(11) DEFAULT NULL,
  `tipp_home` int(11) DEFAULT NULL,
  `tipp_away` int(11) DEFAULT NULL,
  `points` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `tipps`
--

INSERT INTO `tipps` (`id`, `user_id`, `spiel_id`, `tipp_home`, `tipp_away`, `points`) VALUES
(47, 6, 5311, 1, 1, 0),
(48, 6, 5385, 1, 1, 0),
(49, 6, 5312, 2, 2, 0),
(50, 6, 5386, 4, 4, 0),
(51, 7, 5312, 3, 8, 0),
(52, 7, 5330, 12, 1, 0),
(53, 7, 5383, 12, 12, 0),
(54, 8, 5311, 1, 1, 0);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `password` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `famname` varchar(100) DEFAULT NULL,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `created_at`, `password`, `name`, `famname`, `is_approved`) VALUES
(6, 'ad', 'ad@ad.ad', '2025-10-12 10:28:34', 'ad', 'a', 'd', 1),
(7, 'Tobias', 'Tobias@Tobias.Tobias', '2026-05-27 16:42:50', '$2y$10$AncwBDDxVEcLfzo62iCAZuhuR4JpoSg9GuNcnr6./bCQgcvV8Mh0u', NULL, NULL, 1),
(8, 'fdfd', 'df@df.df', '2026-06-10 15:57:22', '$2y$10$p5kNCoNcbSxnXd1ylk8pge00n/GIQ5dgXPLs34/3j1/sAu3LZglCK', NULL, NULL, 1),
(9, 'FADO', 'fahd.wow@live.at', '2026-06-10 20:12:52', '$2y$10$Y7Th/LsO0Kq1Kxeokt4nruUANAYXf2S8ZSxBLg.O1CL62pzKvEwuq', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wm_favorites`
--

CREATE TABLE `wm_favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `champion_team` varchar(120) NOT NULL,
  `top_scorer` varchar(120) NOT NULL,
  `total_goals` int(11) NOT NULL,
  `points_champion` int(11) NOT NULL DEFAULT 0,
  `points_top_scorer` int(11) NOT NULL DEFAULT 0,
  `points_total_goals` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `wm_favorites`
--

INSERT INTO `wm_favorites` (`id`, `user_id`, `champion_team`, `top_scorer`, `total_goals`, `points_champion`, `points_top_scorer`, `points_total_goals`, `created_at`, `updated_at`) VALUES
(1, 6, 'Brazil', 'Cristiano Ronaldo', 235, 0, 0, 0, '2026-05-25 22:53:21', '2026-05-25 22:53:21');

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `forum_messages`
--
ALTER TABLE `forum_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_forum_created` (`created_at`),
  ADD KEY `idx_forum_user` (`user_id`);

--
-- Indizes für die Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_password_resets_token` (`token_hash`),
  ADD KEY `idx_password_resets_account` (`account_type`,`account_id`);

--
-- Indizes für die Tabelle `pending_users`
--
ALTER TABLE `pending_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indizes für die Tabelle `spiele`
--
ALTER TABLE `spiele`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `match_id` (`match_id`),
  ADD UNIQUE KEY `unique_match` (`team_home`,`team_away`,`date`);

--
-- Indizes für die Tabelle `tipps`
--
ALTER TABLE `tipps`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_spiel` (`user_id`,`spiel_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `spiel_id` (`spiel_id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indizes für die Tabelle `wm_favorites`
--
ALTER TABLE `wm_favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_wm_favorites_user` (`user_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `forum_messages`
--
ALTER TABLE `forum_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT für Tabelle `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT für Tabelle `pending_users`
--
ALTER TABLE `pending_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT für Tabelle `spiele`
--
ALTER TABLE `spiele`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5452;

--
-- AUTO_INCREMENT für Tabelle `tipps`
--
ALTER TABLE `tipps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT für Tabelle `wm_favorites`
--
ALTER TABLE `wm_favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `tipps`
--
ALTER TABLE `tipps`
  ADD CONSTRAINT `tipps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tipps_ibfk_2` FOREIGN KEY (`spiel_id`) REFERENCES `spiele` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
