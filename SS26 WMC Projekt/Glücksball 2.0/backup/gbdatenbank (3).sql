-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Erstellungszeit: 26. Mai 2026 um 10:11
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
(1, 6, 'Willkommen', '2026-05-25 23:55:36');

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
(4893, NULL, 'WM 2026 – UEFA', NULL, 'Kroatien', 'Gibraltar', '2025-10-12 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4894, NULL, 'WM 2026 – UEFA', NULL, 'Dänemark', 'Griechenland', '2025-10-12 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4895, NULL, 'WM 2026 – UEFA', NULL, 'Litauen', 'Polen', '2025-10-12 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4896, NULL, 'WM 2026 – UEFA', NULL, 'Rumänien', 'Österreich', '2025-10-12 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4897, NULL, 'WM 2026 – CAF', NULL, 'Burkina Faso', 'Äthiopien', '2025-10-12 21:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4898, NULL, 'WM 2026 – CAF', NULL, 'Dschibuti', 'Sierra Leone', '2025-10-12 21:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4899, NULL, 'WM 2026 – CAF', NULL, 'Ägypten', 'Guinea-Bissau', '2025-10-12 21:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4900, NULL, 'WM 2026 – CAF', NULL, 'Ghana', 'Komoren', '2025-10-12 21:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4901, NULL, 'WM 2026 – CAF', NULL, 'Mali', 'Madagaskar', '2025-10-12 21:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4902, NULL, 'WM 2026 – CAF', NULL, 'Äquatorialguinea', 'Liberia', '2025-10-13 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4903, NULL, 'WM 2026 – CAF', NULL, 'São Tomé und Príncipe', 'Malawi', '2025-10-13 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4904, NULL, 'WM 2026 – CAF', NULL, 'Südsudan', 'Togo', '2025-10-13 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4905, NULL, 'WM 2026 – CAF', NULL, 'Tunesien', 'Namibia', '2025-10-13 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4906, NULL, 'WM 2026 – CAF', NULL, 'Kamerun', 'Angola', '2025-10-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4907, NULL, 'WM 2026 – CAF', NULL, 'Kap Verde', 'Eswatini', '2025-10-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4908, NULL, 'WM 2026 – CAF', NULL, 'Lesotho', 'Simbabwe', '2025-10-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4909, NULL, 'WM 2026 – CAF', NULL, 'Mauritius', 'Libyen', '2025-10-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4910, NULL, 'WM 2026 – UEFA', NULL, 'Island', 'Frankreich', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4911, NULL, 'WM 2026 – UEFA', NULL, 'Nordirland', 'Deutschland', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4912, NULL, 'WM 2026 – UEFA', NULL, 'Nordmazedonien', 'Kasachstan', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4913, NULL, 'WM 2026 – UEFA', NULL, 'Slowakei', 'Luxemburg', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4914, NULL, 'WM 2026 – UEFA', NULL, 'Slowenien', 'Schweiz', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4915, NULL, 'WM 2026 – UEFA', NULL, 'Schweden', 'Kosovo', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4916, NULL, 'WM 2026 – UEFA', NULL, 'Ukraine', 'Aserbaidschan', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4917, NULL, 'WM 2026 – UEFA', NULL, 'Wales', 'Belgien', '2025-10-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4918, NULL, 'WM 2026 – CONCACAF', NULL, 'Honduras', 'Haiti', '2025-10-14 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4919, NULL, 'WM 2026 – CONCACAF', NULL, 'Costa Rica', 'Nicaragua', '2025-10-14 04:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4920, NULL, 'WM 2026 – CAF', NULL, 'Seychellen', 'Gambia', '2025-10-14 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4921, NULL, 'WM 2026 – CAF', NULL, 'Algerien', 'Uganda', '2025-10-14 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4922, NULL, 'WM 2026 – CAF', NULL, 'Guinea', 'Botswana', '2025-10-14 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4923, NULL, 'WM 2026 – CAF', NULL, 'Nigeria', 'Benin', '2025-10-14 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4924, NULL, 'WM 2026 – CAF', NULL, 'Somalia', 'Mosambik', '2025-10-14 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4925, NULL, 'WM 2026 – CAF', NULL, 'Südafrika', 'Ruanda', '2025-10-14 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4926, NULL, 'WM 2026 – AFC', NULL, 'Katar', 'Vereinigte Arabische Emirate', '2025-10-14 19:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4927, NULL, 'WM 2026 – AFC', NULL, 'Saudi-Arabien', 'Irak', '2025-10-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4928, NULL, 'WM 2026 – UEFA', NULL, 'Portugal', 'Ungarn', '2025-10-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4929, NULL, 'WM 2026 – CONCACAF', NULL, 'Curacao', 'Trinidad & Tobago', '2025-10-15 01:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4930, NULL, 'WM 2026 – CONCACAF', NULL, 'Jamaika', 'Bermuda', '2025-10-15 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4931, NULL, 'WM 2026 – CONCACAF', NULL, 'Panama', 'Suriname', '2025-10-15 03:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4932, NULL, 'WM 2026 – CONCACAF', NULL, 'El Salvador', 'Guatemala', '2025-10-15 04:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4933, NULL, 'WM 2026 – UEFA', NULL, 'Armenien', 'Ungarn', '2025-11-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4934, NULL, 'WM 2026 – UEFA', NULL, 'Aserbaidschan', 'Island', '2025-11-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4935, NULL, 'WM 2026 – UEFA', NULL, 'Norwegen', 'Estland', '2025-11-13 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4936, NULL, 'WM 2026 – UEFA', NULL, 'Andorra', 'Albanien', '2025-11-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4937, NULL, 'WM 2026 – UEFA', NULL, 'England', 'Serbien', '2025-11-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4938, NULL, 'WM 2026 – UEFA', NULL, 'Frankreich', 'Ukraine', '2025-11-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4939, NULL, 'WM 2026 – UEFA', NULL, 'Republik Irland', 'Portugal', '2025-11-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4940, NULL, 'WM 2026 – UEFA', NULL, 'Moldawien', 'Italien', '2025-11-13 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4941, NULL, 'WM 2026 – CONCACAF', NULL, 'Bermuda', 'Curacao', '2025-11-13 23:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4942, NULL, 'WM 2026 – CONCACAF', NULL, 'Suriname', 'El Salvador', '2025-11-13 23:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4943, NULL, 'WM 2026 – CONCACAF', NULL, 'Haiti', 'Costa Rica', '2025-11-14 01:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4944, NULL, 'WM 2026 – CONCACAF', NULL, 'Trinidad & Tobago', 'Jamaika', '2025-11-14 01:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4945, NULL, 'WM 2026 – CONCACAF', NULL, 'Guatemala', 'Panama', '2025-11-14 03:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4946, NULL, 'WM 2026 – CONCACAF', NULL, 'Nicaragua', 'Honduras', '2025-11-14 03:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4947, NULL, 'WM 2026 – UEFA', NULL, 'Finnland', 'Malta', '2025-11-14 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4948, NULL, 'WM 2026 – UEFA', NULL, 'Kroatien', 'Färöer', '2025-11-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4949, NULL, 'WM 2026 – UEFA', NULL, 'Gibraltar', 'Montenegro', '2025-11-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4950, NULL, 'WM 2026 – UEFA', NULL, 'Luxemburg', 'Deutschland', '2025-11-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4951, NULL, 'WM 2026 – UEFA', NULL, 'Polen', 'Niederlande', '2025-11-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4952, NULL, 'WM 2026 – UEFA', NULL, 'Slowakei', 'Nordirland', '2025-11-14 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4953, NULL, 'WM 2026 – UEFA', NULL, 'Kasachstan', 'Belgien', '2025-11-15 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4954, NULL, 'WM 2026 – UEFA', NULL, 'Zypern', 'Österreich', '2025-11-15 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4955, NULL, 'WM 2026 – UEFA', NULL, 'Georgien', 'Spanien', '2025-11-15 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4956, NULL, 'WM 2026 – UEFA', NULL, 'Liechtenstein', 'Wales', '2025-11-15 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4957, NULL, 'WM 2026 – UEFA', NULL, 'Türkei', 'Bulgarien', '2025-11-15 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4958, NULL, 'WM 2026 – UEFA', NULL, 'Bosnien und Herzegowina', 'Rumänien', '2025-11-15 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4959, NULL, 'WM 2026 – UEFA', NULL, 'Dänemark', 'Weißrussland', '2025-11-15 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4960, NULL, 'WM 2026 – UEFA', NULL, 'Griechenland', 'Schottland', '2025-11-15 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4961, NULL, 'WM 2026 – UEFA', NULL, 'Slowenien', 'Kosovo', '2025-11-15 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4962, NULL, 'WM 2026 – UEFA', NULL, 'Schweiz', 'Schweden', '2025-11-15 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4963, NULL, 'WM 2026 – UEFA', NULL, 'Ungarn', 'Republik Irland', '2025-11-16 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4964, NULL, 'WM 2026 – UEFA', NULL, 'Portugal', 'Armenien', '2025-11-16 15:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4965, NULL, 'WM 2026 – UEFA', NULL, 'Albanien', 'England', '2025-11-16 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4966, NULL, 'WM 2026 – UEFA', NULL, 'Aserbaidschan', 'Frankreich', '2025-11-16 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4967, NULL, 'WM 2026 – UEFA', NULL, 'Serbien', 'Lettland', '2025-11-16 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4968, NULL, 'WM 2026 – UEFA', NULL, 'Ukraine', 'Island', '2025-11-16 18:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4969, NULL, 'WM 2026 – UEFA', NULL, 'Israel', 'Moldawien', '2025-11-16 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4970, NULL, 'WM 2026 – UEFA', NULL, 'Italien', 'Norwegen', '2025-11-16 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4971, NULL, 'WM 2026 – UEFA', NULL, 'Tschechien', 'Gibraltar', '2025-11-17 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4972, NULL, 'WM 2026 – UEFA', NULL, 'Deutschland', 'Slowakei', '2025-11-17 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4973, NULL, 'WM 2026 – UEFA', NULL, 'Malta', 'Polen', '2025-11-17 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4974, NULL, 'WM 2026 – UEFA', NULL, 'Montenegro', 'Kroatien', '2025-11-17 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4975, NULL, 'WM 2026 – UEFA', NULL, 'Niederlande', 'Litauen', '2025-11-17 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4976, NULL, 'WM 2026 – UEFA', NULL, 'Nordirland', 'Luxemburg', '2025-11-17 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4977, NULL, 'WM 2026 – UEFA', NULL, 'Österreich', 'Bosnien und Herzegowina', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4978, NULL, 'WM 2026 – UEFA', NULL, 'Weißrussland', 'Griechenland', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4979, NULL, 'WM 2026 – UEFA', NULL, 'Belgien', 'Liechtenstein', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4980, NULL, 'WM 2026 – UEFA', NULL, 'Bulgarien', 'Georgien', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4981, NULL, 'WM 2026 – UEFA', NULL, 'Kosovo', 'Schweiz', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4982, NULL, 'WM 2026 – UEFA', NULL, 'Rumänien', 'San Marino', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4983, NULL, 'WM 2026 – UEFA', NULL, 'Schottland', 'Dänemark', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4984, NULL, 'WM 2026 – UEFA', NULL, 'Spanien', 'Türkei', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4985, NULL, 'WM 2026 – UEFA', NULL, 'Schweden', 'Slowenien', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4986, NULL, 'WM 2026 – UEFA', NULL, 'Wales', 'Nordmazedonien', '2025-11-18 20:45:00', NULL, NULL, 'upcoming', NULL, 1),
(4987, NULL, 'WM 2026 – CONCACAF', NULL, 'Costa Rica', 'Honduras', '2025-11-19 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4988, NULL, 'WM 2026 – CONCACAF', NULL, 'Guatemala', 'Suriname', '2025-11-19 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4989, NULL, 'WM 2026 – CONCACAF', NULL, 'Haiti', 'Nicaragua', '2025-11-19 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4990, NULL, 'WM 2026 – CONCACAF', NULL, 'Jamaika', 'Curacao', '2025-11-19 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4991, NULL, 'WM 2026 – CONCACAF', NULL, 'Panama', 'El Salvador', '2025-11-19 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(4992, NULL, 'WM 2026 – CONCACAF', NULL, 'Trinidad & Tobago', 'Bermuda', '2025-11-19 02:00:00', NULL, NULL, 'upcoming', NULL, 1),
(5311, 'WC2026-M01', 'WM 2026', 'Group A', 'Mexico', 'South Africa', '2026-06-11 13:00:00', NULL, NULL, 'upcoming', 'Estadio Azteca, Mexico City', 1),
(5312, 'WC2026-M02', 'WM 2026', 'Group A', 'South Korea', 'Czech Republic', '2026-06-11 20:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Guadalajara', 1),
(5313, 'WC2026-M03', 'WM 2026', 'Group B', 'Canada', 'Bosnia and Herzegovina', '2026-06-12 15:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5314, 'WC2026-M04', 'WM 2026', 'Group D', 'United States', 'Paraguay', '2026-06-12 18:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Los Angeles', 1),
(5315, 'WC2026-M05', 'WM 2026', 'Group C', 'Haiti', 'Scotland', '2026-06-13 21:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Boston', 1),
(5316, 'WC2026-M06', 'WM 2026', 'Group D', 'Australia', 'Turkey', '2026-06-13 21:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5317, 'WC2026-M07', 'WM 2026', 'Group C', 'Brazil', 'Morocco', '2026-06-13 18:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, New York / New Jersey', 1),
(5318, 'WC2026-M08', 'WM 2026', 'Group B', 'Qatar', 'Switzerland', '2026-06-13 12:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, San Francisco Bay Area', 1),
(5319, 'WC2026-M09', 'WM 2026', 'Group E', 'Ivory Coast', 'Ecuador', '2026-06-14 19:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5320, 'WC2026-M10', 'WM 2026', 'Group E', 'Germany', 'Curacao', '2026-06-14 12:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5321, 'WC2026-M11', 'WM 2026', 'Group F', 'Netherlands', 'Japan', '2026-06-14 15:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Dallas', 1),
(5322, 'WC2026-M12', 'WM 2026', 'Group F', 'Sweden', 'Tunisia', '2026-06-14 20:00:00', NULL, NULL, 'upcoming', 'Estadio BBVA, Monterrey', 1),
(5323, 'WC2026-M13', 'WM 2026', 'Group H', 'Saudi Arabia', 'Uruguay', '2026-06-15 18:00:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami', 1),
(5324, 'WC2026-M14', 'WM 2026', 'Group H', 'Spain', 'Cape Verde', '2026-06-15 12:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5325, 'WC2026-M15', 'WM 2026', 'Group G', 'Iran', 'New Zealand', '2026-06-15 18:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Los Angeles', 1),
(5326, 'WC2026-M16', 'WM 2026', 'Group G', 'Belgium', 'Egypt', '2026-06-15 12:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5327, 'WC2026-M17', 'WM 2026', 'Group I', 'France', 'Senegal', '2026-06-16 15:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, New York / New Jersey', 1),
(5328, 'WC2026-M18', 'WM 2026', 'Group I', 'Iraq', 'Norway', '2026-06-16 18:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Boston', 1),
(5329, 'WC2026-M19', 'WM 2026', 'Group J', 'Argentina', 'Algeria', '2026-06-16 20:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5330, 'WC2026-M20', 'WM 2026', 'Group J', 'Austria', 'Jordan', '2026-06-16 21:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, San Francisco Bay Area', 1),
(5331, 'WC2026-M21', 'WM 2026', 'Group L', 'Ghana', 'Panama', '2026-06-17 19:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5332, 'WC2026-M22', 'WM 2026', 'Group L', 'England', 'Croatia', '2026-06-17 15:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Dallas', 1),
(5333, 'WC2026-M23', 'WM 2026', 'Group K', 'Portugal', 'DR Congo', '2026-06-17 12:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5334, 'WC2026-M24', 'WM 2026', 'Group K', 'Uzbekistan', 'Colombia', '2026-06-17 20:00:00', NULL, NULL, 'upcoming', 'Estadio Azteca, Mexico City', 1),
(5335, 'WC2026-M25', 'WM 2026', 'Group A', 'Czech Republic', 'South Africa', '2026-06-18 12:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5336, 'WC2026-M26', 'WM 2026', 'Group B', 'Switzerland', 'Bosnia and Herzegovina', '2026-06-18 12:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Los Angeles', 1),
(5337, 'WC2026-M27', 'WM 2026', 'Group B', 'Canada', 'Qatar', '2026-06-18 15:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5338, 'WC2026-M28', 'WM 2026', 'Group A', 'Mexico', 'South Korea', '2026-06-18 19:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Guadalajara', 1),
(5339, 'WC2026-M29', 'WM 2026', 'Group C', 'Brazil', 'Haiti', '2026-06-19 21:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5340, 'WC2026-M30', 'WM 2026', 'Group C', 'Scotland', 'Morocco', '2026-06-19 18:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Boston', 1),
(5341, 'WC2026-M31', 'WM 2026', 'Group D', 'Turkey', 'Paraguay', '2026-06-19 20:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, San Francisco Bay Area', 1),
(5342, 'WC2026-M32', 'WM 2026', 'Group D', 'United States', 'Australia', '2026-06-19 12:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5343, 'WC2026-M33', 'WM 2026', 'Group E', 'Germany', 'Ivory Coast', '2026-06-20 16:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5344, 'WC2026-M34', 'WM 2026', 'Group E', 'Ecuador', 'Curacao', '2026-06-20 19:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5345, 'WC2026-M35', 'WM 2026', 'Group F', 'Netherlands', 'Sweden', '2026-06-20 12:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5346, 'WC2026-M36', 'WM 2026', 'Group F', 'Tunisia', 'Japan', '2026-06-20 22:00:00', NULL, NULL, 'upcoming', 'Estadio BBVA, Monterrey', 1),
(5347, 'WC2026-M37', 'WM 2026', 'Group H', 'Uruguay', 'Cape Verde', '2026-06-21 18:00:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami', 1),
(5348, 'WC2026-M38', 'WM 2026', 'Group H', 'Spain', 'Saudi Arabia', '2026-06-21 12:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5349, 'WC2026-M39', 'WM 2026', 'Group G', 'Belgium', 'Iran', '2026-06-21 12:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Los Angeles', 1),
(5350, 'WC2026-M40', 'WM 2026', 'Group G', 'New Zealand', 'Egypt', '2026-06-21 18:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5351, 'WC2026-M41', 'WM 2026', 'Group I', 'Norway', 'Senegal', '2026-06-22 20:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, New York / New Jersey', 1),
(5352, 'WC2026-M42', 'WM 2026', 'Group I', 'France', 'Iraq', '2026-06-22 17:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5353, 'WC2026-M43', 'WM 2026', 'Group J', 'Argentina', 'Austria', '2026-06-22 12:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Dallas', 1),
(5354, 'WC2026-M44', 'WM 2026', 'Group J', 'Jordan', 'Algeria', '2026-06-22 20:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, San Francisco Bay Area', 1),
(5355, 'WC2026-M45', 'WM 2026', 'Group L', 'England', 'Ghana', '2026-06-23 16:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Boston', 1),
(5356, 'WC2026-M46', 'WM 2026', 'Group L', 'Panama', 'Croatia', '2026-06-23 19:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5357, 'WC2026-M47', 'WM 2026', 'Group K', 'Portugal', 'Uzbekistan', '2026-06-23 12:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5358, 'WC2026-M48', 'WM 2026', 'Group K', 'Colombia', 'DR Congo', '2026-06-23 20:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Guadalajara', 1),
(5359, 'WC2026-M49', 'WM 2026', 'Group C', 'Scotland', 'Brazil', '2026-06-24 18:00:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami', 1),
(5360, 'WC2026-M50', 'WM 2026', 'Group C', 'Morocco', 'Haiti', '2026-06-24 18:00:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5361, 'WC2026-M51', 'WM 2026', 'Group B', 'Switzerland', 'Canada', '2026-06-24 12:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5362, 'WC2026-M52', 'WM 2026', 'Group B', 'Bosnia and Herzegovina', 'Qatar', '2026-06-24 12:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5363, 'WC2026-M53', 'WM 2026', 'Group A', 'Czech Republic', 'Mexico', '2026-06-24 19:00:00', NULL, NULL, 'upcoming', 'Estadio Azteca, Mexico City', 1),
(5364, 'WC2026-M54', 'WM 2026', 'Group A', 'South Africa', 'South Korea', '2026-06-24 19:00:00', NULL, NULL, 'upcoming', 'Estadio BBVA, Monterrey', 1),
(5365, 'WC2026-M55', 'WM 2026', 'Group E', 'Curacao', 'Ivory Coast', '2026-06-25 16:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5366, 'WC2026-M56', 'WM 2026', 'Group E', 'Ecuador', 'Germany', '2026-06-25 16:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, New York / New Jersey', 1),
(5367, 'WC2026-M57', 'WM 2026', 'Group F', 'Japan', 'Sweden', '2026-06-25 18:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Dallas', 1),
(5368, 'WC2026-M58', 'WM 2026', 'Group F', 'Tunisia', 'Netherlands', '2026-06-25 18:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5369, 'WC2026-M59', 'WM 2026', 'Group D', 'Turkey', 'United States', '2026-06-25 19:00:00', NULL, NULL, 'upcoming', 'SoFi Stadium, Los Angeles', 1),
(5370, 'WC2026-M60', 'WM 2026', 'Group D', 'Paraguay', 'Australia', '2026-06-25 19:00:00', NULL, NULL, 'upcoming', 'Levi\'s Stadium, San Francisco Bay Area', 1),
(5371, 'WC2026-M61', 'WM 2026', 'Group I', 'Norway', 'France', '2026-06-26 15:00:00', NULL, NULL, 'upcoming', 'Gillette Stadium, Boston', 1),
(5372, 'WC2026-M62', 'WM 2026', 'Group I', 'Senegal', 'Iraq', '2026-06-26 15:00:00', NULL, NULL, 'upcoming', 'BMO Field, Toronto', 1),
(5373, 'WC2026-M63', 'WM 2026', 'Group G', 'Egypt', 'Iran', '2026-06-26 20:00:00', NULL, NULL, 'upcoming', 'Lumen Field, Seattle', 1),
(5374, 'WC2026-M64', 'WM 2026', 'Group G', 'New Zealand', 'Belgium', '2026-06-26 20:00:00', NULL, NULL, 'upcoming', 'BC Place, Vancouver', 1),
(5375, 'WC2026-M65', 'WM 2026', 'Group H', 'Cape Verde', 'Saudi Arabia', '2026-06-26 19:00:00', NULL, NULL, 'upcoming', 'NRG Stadium, Houston', 1),
(5376, 'WC2026-M66', 'WM 2026', 'Group H', 'Uruguay', 'Spain', '2026-06-26 18:00:00', NULL, NULL, 'upcoming', 'Estadio Akron, Guadalajara', 1),
(5377, 'WC2026-M67', 'WM 2026', 'Group L', 'Panama', 'England', '2026-06-27 17:00:00', NULL, NULL, 'upcoming', 'MetLife Stadium, New York / New Jersey', 1),
(5378, 'WC2026-M68', 'WM 2026', 'Group L', 'Croatia', 'Ghana', '2026-06-27 17:00:00', NULL, NULL, 'upcoming', 'Lincoln Financial Field, Philadelphia', 1),
(5379, 'WC2026-M69', 'WM 2026', 'Group J', 'Algeria', 'Austria', '2026-06-27 21:00:00', NULL, NULL, 'upcoming', 'Arrowhead Stadium, Kansas City', 1),
(5380, 'WC2026-M70', 'WM 2026', 'Group J', 'Jordan', 'Argentina', '2026-06-27 21:00:00', NULL, NULL, 'upcoming', 'AT&T Stadium, Dallas', 1),
(5381, 'WC2026-M71', 'WM 2026', 'Group K', 'Colombia', 'Portugal', '2026-06-27 19:30:00', NULL, NULL, 'upcoming', 'Hard Rock Stadium, Miami', 1),
(5382, 'WC2026-M72', 'WM 2026', 'Group K', 'DR Congo', 'Uzbekistan', '2026-06-27 19:30:00', NULL, NULL, 'upcoming', 'Mercedes-Benz Stadium, Atlanta', 1),
(5383, 'FRI-2026-0601-TUN-AUT', 'Freundschaftsspiel', 'Spaßtipp', 'Tunesien', 'Österreich', '2026-06-01 20:45:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5385, 'FRI-2026-0601-TUR-MKD', 'Freundschaftsspiel', 'Spaßtipp', 'Türkei', 'Nordmazedonien', '2026-06-01 18:30:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5386, 'FRI-2026-0601-NOR-SWE', 'Freundschaftsspiel', 'Spaßtipp', 'Norwegen', 'Schweden', '2026-06-01 19:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5387, 'FRI-2026-0602-CRO-BEL', 'Freundschaftsspiel', 'Spaßtipp', 'Kroatien', 'Belgien', '2026-06-02 18:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5388, 'FRI-2026-0602-WAL-GHA', 'Freundschaftsspiel', 'Spaßtipp', 'Wales', 'Ghana', '2026-06-02 20:45:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5389, 'FRI-2026-0603-DEN-UKR', 'Freundschaftsspiel', 'Spaßtipp', 'Dänemark', 'Ukraine', '2026-06-03 18:30:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5390, 'FRI-2026-0603-LUX-ITA', 'Freundschaftsspiel', 'Spaßtipp', 'Luxemburg', 'Italien', '2026-06-03 20:45:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5391, 'FRI-2026-0603-NED-ALG', 'Freundschaftsspiel', 'Spaßtipp', 'Niederlande', 'Algerien', '2026-06-03 20:45:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5392, 'FRI-2026-0603-POL-NGA', 'Freundschaftsspiel', 'Spaßtipp', 'Polen', 'Nigeria', '2026-06-03 20:45:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5393, 'FRI-2026-0604-SWE-GRE', 'Freundschaftsspiel', 'Spaßtipp', 'Schweden', 'Griechenland', '2026-06-04 19:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5394, 'FRI-2026-0604-ESP-IRQ', 'Freundschaftsspiel', 'Spaßtipp', 'Spanien', 'Irak', '2026-06-04 21:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5395, 'FRI-2026-0606-BEL-TUN', 'Freundschaftsspiel', 'Spaßtipp', 'Belgien', 'Tunesien', '2026-06-06 15:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5396, 'FRI-2026-0606-POR-CHI', 'Freundschaftsspiel', 'Spaßtipp', 'Portugal', 'Chile', '2026-06-06 19:45:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5397, 'FRI-2026-0606-USA-GER', 'Freundschaftsspiel', 'Spaßtipp', 'USA', 'Deutschland', '2026-06-06 20:30:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5398, 'FRI-2026-0606-BRA-EGY', 'Freundschaftsspiel', 'Spaßtipp', 'Brasilien', 'Ägypten', '2026-06-06 22:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5399, 'FRI-2026-0606-ENG-NZL', 'Freundschaftsspiel', 'Spaßtipp', 'England', 'Neuseeland', '2026-06-06 22:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5400, 'FRI-2026-0607-ARG-HON', 'Freundschaftsspiel', 'Spaßtipp', 'Argentinien', 'Honduras', '2026-06-07 02:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5401, 'FRI-2026-0607-MAR-NOR', 'Freundschaftsspiel', 'Spaßtipp', 'Marokko', 'Norwegen', '2026-06-07 21:00:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5402, 'FRI-2026-0608-FRA-NIR', 'Freundschaftsspiel', 'Spaßtipp', 'Frankreich', 'Nordirland', '2026-06-08 21:10:00', NULL, NULL, 'upcoming', 'TBD', 1),
(5403, 'FRI-2026-0610-POR-NGA', 'Freundschaftsspiel', 'Spaßtipp', 'Portugal', 'Nigeria', '2026-06-10 21:45:00', NULL, NULL, 'upcoming', 'TBD', 1);

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
(48, 6, 5385, 1, 1, 0);

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
  `famname` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `created_at`, `password`, `name`, `famname`) VALUES
(6, 'ad', 'ad@ad.ad', '2025-10-12 10:28:34', 'ad', 'a', 'd');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT für Tabelle `spiele`
--
ALTER TABLE `spiele`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5404;

--
-- AUTO_INCREMENT für Tabelle `tipps`
--
ALTER TABLE `tipps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
