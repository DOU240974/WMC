<?php
declare(strict_types=1);

function ensure_match_seed(PDO $pdo): void {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS spiele (
      id INT AUTO_INCREMENT PRIMARY KEY,
      match_id VARCHAR(50) DEFAULT NULL,
      competition VARCHAR(100) DEFAULT '',
      group_name VARCHAR(255) DEFAULT NULL,
      team_home VARCHAR(100) DEFAULT NULL,
      team_away VARCHAR(100) DEFAULT NULL,
      date DATETIME DEFAULT NULL,
      score_home INT DEFAULT NULL,
      score_away INT DEFAULT NULL,
      status ENUM('upcoming','finished') DEFAULT 'upcoming',
      url TEXT DEFAULT NULL,
      aktiv TINYINT(1) DEFAULT 1,
      KEY idx_competition_match (competition, match_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  seed_matches($pdo, 'WM 2026', official_world_cup_group_matches());
  seed_matches($pdo, 'WM 2026', official_world_cup_knockout_matches());
  $friendlies = friendly_matches();
  seed_matches($pdo, 'Freundschaftsspiel', $friendlies);
  deactivate_missing_seed_matches($pdo, 'Freundschaftsspiel', 'FRI-2026-%', array_column($friendlies, 0));
}

function seed_matches(PDO $pdo, string $competition, array $matches): void {
  $exists = $pdo->prepare("
    SELECT id
    FROM spiele
    WHERE competition = :competition
      AND match_id = :match_id
    LIMIT 1
  ");

  $insert = $pdo->prepare("
    INSERT INTO spiele (match_id, competition, group_name, team_home, team_away, date, status, url, aktiv)
    VALUES (:match_id, :competition, :group_name, :team_home, :team_away, :date, 'upcoming', :venue, 1)
  ");

  $update = $pdo->prepare("
    UPDATE spiele
    SET group_name = :group_name,
        team_home = :team_home,
        team_away = :team_away,
        date = :date,
        url = :venue,
        aktiv = 1
    WHERE id = :id
  ");

  foreach ($matches as $match) {
    $params = [
      ':match_id' => $match[0],
      ':competition' => $competition,
      ':group_name' => $match[1],
      ':team_home' => $match[2],
      ':team_away' => $match[3],
      ':date' => $match[4],
      ':venue' => $match[5],
    ];

    $exists->execute([
      ':competition' => $competition,
      ':match_id' => $match[0],
    ]);

    $row = $exists->fetch(PDO::FETCH_ASSOC);
    if ($row) {
      $update->execute([
        ':id' => (int)$row['id'],
        ':group_name' => $match[1],
        ':team_home' => $match[2],
        ':team_away' => $match[3],
        ':date' => $match[4],
        ':venue' => $match[5],
      ]);
      continue;
    }

    $insert->execute($params);
  }
}

function deactivate_missing_seed_matches(PDO $pdo, string $competition, string $matchIdLike, array $activeMatchIds): void {
  if (count($activeMatchIds) === 0) {
    return;
  }

  $placeholders = implode(',', array_fill(0, count($activeMatchIds), '?'));
  $stmt = $pdo->prepare("
    UPDATE spiele
    SET aktiv = 0
    WHERE competition = ?
      AND match_id LIKE ?
      AND match_id NOT IN ($placeholders)
  ");

  $stmt->execute(array_merge([$competition, $matchIdLike], $activeMatchIds));
}

function official_world_cup_group_matches(): array {
  return [
    ['WC2026-M01', 'Group A', 'Mexico', 'South Africa', '2026-06-11 21:00:00', 'Estadio Azteca, Mexico City'],
    ['WC2026-M02', 'Group A', 'South Korea', 'Czech Republic', '2026-06-12 04:00:00', 'Estadio Akron, Zapopan'],
    ['WC2026-M03', 'Group B', 'Canada', 'Bosnia and Herzegovina', '2026-06-12 21:00:00', 'BMO Field, Toronto'],
    ['WC2026-M04', 'Group D', 'United States', 'Paraguay', '2026-06-13 03:00:00', 'SoFi Stadium, Inglewood'],
    ['WC2026-M05', 'Group C', 'Haiti', 'Scotland', '2026-06-14 03:00:00', 'Gillette Stadium, Foxborough'],
    ['WC2026-M06', 'Group D', 'Australia', 'Turkey', '2026-06-14 06:00:00', 'BC Place, Vancouver'],
    ['WC2026-M07', 'Group C', 'Brazil', 'Morocco', '2026-06-14 00:00:00', 'MetLife Stadium, East Rutherford'],
    ['WC2026-M08', 'Group B', 'Qatar', 'Switzerland', '2026-06-13 21:00:00', "Levi's Stadium, Santa Clara"],
    ['WC2026-M09', 'Group E', 'Ivory Coast', 'Ecuador', '2026-06-15 01:00:00', 'Lincoln Financial Field, Philadelphia'],
    ['WC2026-M10', 'Group E', 'Germany', 'Curacao', '2026-06-14 19:00:00', 'NRG Stadium, Houston'],
    ['WC2026-M11', 'Group F', 'Netherlands', 'Japan', '2026-06-14 22:00:00', 'AT&T Stadium, Arlington'],
    ['WC2026-M12', 'Group F', 'Sweden', 'Tunisia', '2026-06-15 04:00:00', 'Estadio BBVA, Guadalupe'],
    ['WC2026-M13', 'Group H', 'Saudi Arabia', 'Uruguay', '2026-06-16 00:00:00', 'Hard Rock Stadium, Miami Gardens'],
    ['WC2026-M14', 'Group H', 'Spain', 'Cape Verde', '2026-06-15 18:00:00', 'Mercedes-Benz Stadium, Atlanta'],
    ['WC2026-M15', 'Group G', 'Iran', 'New Zealand', '2026-06-16 03:00:00', 'SoFi Stadium, Inglewood'],
    ['WC2026-M16', 'Group G', 'Belgium', 'Egypt', '2026-06-15 21:00:00', 'Lumen Field, Seattle'],
    ['WC2026-M17', 'Group I', 'France', 'Senegal', '2026-06-16 21:00:00', 'MetLife Stadium, East Rutherford'],
    ['WC2026-M18', 'Group I', 'Iraq', 'Norway', '2026-06-17 00:00:00', 'Gillette Stadium, Foxborough'],
    ['WC2026-M19', 'Group J', 'Argentina', 'Algeria', '2026-06-17 03:00:00', 'Arrowhead Stadium, Kansas City'],
    ['WC2026-M20', 'Group J', 'Austria', 'Jordan', '2026-06-17 06:00:00', "Levi's Stadium, Santa Clara"],
    ['WC2026-M21', 'Group L', 'Ghana', 'Panama', '2026-06-18 01:00:00', 'Toronto Stadium, Toronto'],
    ['WC2026-M22', 'Group L', 'England', 'Croatia', '2026-06-17 22:00:00', 'AT&T Stadium, Arlington'],
    ['WC2026-M23', 'Group K', 'Portugal', 'DR Congo', '2026-06-17 19:00:00', 'NRG Stadium, Houston'],
    ['WC2026-M24', 'Group K', 'Uzbekistan', 'Colombia', '2026-06-18 04:00:00', 'Estadio Azteca, Mexico City'],
    ['WC2026-M25', 'Group A', 'Czech Republic', 'South Africa', '2026-06-18 18:00:00', 'Mercedes-Benz Stadium, Atlanta'],
    ['WC2026-M26', 'Group B', 'Switzerland', 'Bosnia and Herzegovina', '2026-06-18 21:00:00', 'SoFi Stadium, Inglewood'],
    ['WC2026-M27', 'Group B', 'Canada', 'Qatar', '2026-06-19 00:00:00', 'BC Place, Vancouver'],
    ['WC2026-M28', 'Group A', 'Mexico', 'South Korea', '2026-06-19 03:00:00', 'Estadio Akron, Zapopan'],
    ['WC2026-M29', 'Group C', 'Brazil', 'Haiti', '2026-06-20 02:30:00', 'Lincoln Financial Field, Philadelphia'],
    ['WC2026-M30', 'Group C', 'Scotland', 'Morocco', '2026-06-20 00:00:00', 'Gillette Stadium, Foxborough'],
    ['WC2026-M31', 'Group D', 'Turkey', 'Paraguay', '2026-06-20 05:00:00', "Levi's Stadium, Santa Clara"],
    ['WC2026-M32', 'Group D', 'United States', 'Australia', '2026-06-19 21:00:00', 'Lumen Field, Seattle'],
    ['WC2026-M33', 'Group E', 'Germany', 'Ivory Coast', '2026-06-20 22:00:00', 'BMO Field, Toronto'],
    ['WC2026-M34', 'Group E', 'Ecuador', 'Curacao', '2026-06-21 02:00:00', 'Arrowhead Stadium, Kansas City'],
    ['WC2026-M35', 'Group F', 'Netherlands', 'Sweden', '2026-06-20 19:00:00', 'NRG Stadium, Houston'],
    ['WC2026-M36', 'Group F', 'Tunisia', 'Japan', '2026-06-21 06:00:00', 'Estadio BBVA, Guadalupe'],
    ['WC2026-M37', 'Group H', 'Uruguay', 'Cape Verde', '2026-06-22 00:00:00', 'Hard Rock Stadium, Miami Gardens'],
    ['WC2026-M38', 'Group H', 'Spain', 'Saudi Arabia', '2026-06-21 18:00:00', 'Mercedes-Benz Stadium, Atlanta'],
    ['WC2026-M39', 'Group G', 'Belgium', 'Iran', '2026-06-21 21:00:00', 'SoFi Stadium, Inglewood'],
    ['WC2026-M40', 'Group G', 'New Zealand', 'Egypt', '2026-06-22 03:00:00', 'BC Place, Vancouver'],
    ['WC2026-M41', 'Group I', 'Norway', 'Senegal', '2026-06-23 02:00:00', 'MetLife Stadium, East Rutherford'],
    ['WC2026-M42', 'Group I', 'France', 'Iraq', '2026-06-22 23:00:00', 'Lincoln Financial Field, Philadelphia'],
    ['WC2026-M43', 'Group J', 'Argentina', 'Austria', '2026-06-22 19:00:00', 'AT&T Stadium, Arlington'],
    ['WC2026-M44', 'Group J', 'Jordan', 'Algeria', '2026-06-23 05:00:00', "Levi's Stadium, Santa Clara"],
    ['WC2026-M45', 'Group L', 'England', 'Ghana', '2026-06-23 22:00:00', 'Gillette Stadium, Foxborough'],
    ['WC2026-M46', 'Group L', 'Panama', 'Croatia', '2026-06-24 01:00:00', 'Toronto Stadium, Toronto'],
    ['WC2026-M47', 'Group K', 'Portugal', 'Uzbekistan', '2026-06-23 19:00:00', 'NRG Stadium, Houston'],
    ['WC2026-M48', 'Group K', 'Colombia', 'DR Congo', '2026-06-24 04:00:00', 'Estadio Akron, Zapopan'],
    ['WC2026-M49', 'Group C', 'Scotland', 'Brazil', '2026-06-25 00:00:00', 'Hard Rock Stadium, Miami Gardens'],
    ['WC2026-M50', 'Group C', 'Morocco', 'Haiti', '2026-06-25 00:00:00', 'Mercedes-Benz Stadium, Atlanta'],
    ['WC2026-M51', 'Group B', 'Switzerland', 'Canada', '2026-06-24 21:00:00', 'BC Place, Vancouver'],
    ['WC2026-M52', 'Group B', 'Bosnia and Herzegovina', 'Qatar', '2026-06-24 21:00:00', 'Lumen Field, Seattle'],
    ['WC2026-M53', 'Group A', 'Czech Republic', 'Mexico', '2026-06-25 03:00:00', 'Estadio Azteca, Mexico City'],
    ['WC2026-M54', 'Group A', 'South Africa', 'South Korea', '2026-06-25 03:00:00', 'Estadio BBVA, Guadalupe'],
    ['WC2026-M55', 'Group E', 'Curacao', 'Ivory Coast', '2026-06-25 22:00:00', 'Lincoln Financial Field, Philadelphia'],
    ['WC2026-M56', 'Group E', 'Ecuador', 'Germany', '2026-06-25 22:00:00', 'MetLife Stadium, East Rutherford'],
    ['WC2026-M57', 'Group F', 'Japan', 'Sweden', '2026-06-26 01:00:00', 'AT&T Stadium, Arlington'],
    ['WC2026-M58', 'Group F', 'Tunisia', 'Netherlands', '2026-06-26 01:00:00', 'Arrowhead Stadium, Kansas City'],
    ['WC2026-M59', 'Group D', 'Turkey', 'United States', '2026-06-26 04:00:00', 'SoFi Stadium, Inglewood'],
    ['WC2026-M60', 'Group D', 'Paraguay', 'Australia', '2026-06-26 04:00:00', "Levi's Stadium, Santa Clara"],
    ['WC2026-M61', 'Group I', 'Norway', 'France', '2026-06-26 21:00:00', 'Gillette Stadium, Foxborough'],
    ['WC2026-M62', 'Group I', 'Senegal', 'Iraq', '2026-06-26 21:00:00', 'BMO Field, Toronto'],
    ['WC2026-M63', 'Group G', 'Egypt', 'Iran', '2026-06-27 05:00:00', 'Lumen Field, Seattle'],
    ['WC2026-M64', 'Group G', 'New Zealand', 'Belgium', '2026-06-27 05:00:00', 'BC Place, Vancouver'],
    ['WC2026-M65', 'Group H', 'Cape Verde', 'Saudi Arabia', '2026-06-27 02:00:00', 'NRG Stadium, Houston'],
    ['WC2026-M66', 'Group H', 'Uruguay', 'Spain', '2026-06-27 02:00:00', 'Estadio Akron, Zapopan'],
    ['WC2026-M67', 'Group L', 'Panama', 'England', '2026-06-27 23:00:00', 'MetLife Stadium, East Rutherford'],
    ['WC2026-M68', 'Group L', 'Croatia', 'Ghana', '2026-06-27 23:00:00', 'Lincoln Financial Field, Philadelphia'],
    ['WC2026-M69', 'Group J', 'Algeria', 'Austria', '2026-06-28 04:00:00', 'Arrowhead Stadium, Kansas City'],
    ['WC2026-M70', 'Group J', 'Jordan', 'Argentina', '2026-06-28 04:00:00', 'AT&T Stadium, Arlington'],
    ['WC2026-M71', 'Group K', 'Colombia', 'Portugal', '2026-06-28 01:30:00', 'Hard Rock Stadium, Miami Gardens'],
    ['WC2026-M72', 'Group K', 'DR Congo', 'Uzbekistan', '2026-06-28 01:30:00', 'Mercedes-Benz Stadium, Atlanta'],
  ];
}

function friendly_matches(): array {
  return [
    ['FRI-2026-0610-PAK-AFG', 'Männer-Freundschaftsspiel', 'Pakistan', 'Afghanistan', '2026-06-10 18:00:00', 'Männer-Nationalteams'],
    ['FRI-2026-0610-POR-NGA', 'Männer-Freundschaftsspiel', 'Portugal', 'Nigeria', '2026-06-10 21:45:00', 'Männer-Nationalteams'],
    ['FRI-2026-0610-ENG-CRC', 'Männer-Freundschaftsspiel', 'England', 'Costa Rica', '2026-06-10 22:00:00', 'Männer-Nationalteams'],
  ];
}

function official_world_cup_knockout_matches(): array {
  return [
    ['WC2026-M73', 'Sechzehntelfinale', '2. Gruppe A', '2. Gruppe B', '2026-06-28 21:00:00', 'Los Angeles'],
    ['WC2026-M74', 'Sechzehntelfinale', '1. Gruppe E', '3. A/B/C/D/F', '2026-06-29 22:30:00', 'Boston'],
    ['WC2026-M75', 'Sechzehntelfinale', '1. Gruppe F', '2. Gruppe C', '2026-06-30 03:00:00', 'Monterrey'],
    ['WC2026-M76', 'Sechzehntelfinale', '1. Gruppe C', '2. Gruppe F', '2026-06-29 19:00:00', 'Houston'],
    ['WC2026-M77', 'Sechzehntelfinale', '1. Gruppe I', '3. C/D/F/G/H', '2026-06-30 23:00:00', 'NY/New Jersey'],
    ['WC2026-M78', 'Sechzehntelfinale', '2. Gruppe E', '2. Gruppe I', '2026-06-30 19:00:00', 'Dallas'],
    ['WC2026-M79', 'Sechzehntelfinale', '1. Gruppe A', '3. C/E/F/H/I', '2026-07-01 02:00:00', 'Mexico-Stadt'],
    ['WC2026-M80', 'Sechzehntelfinale', '1. Gruppe L', '3. E/H/I/J/K', '2026-07-01 18:00:00', 'Atlanta'],
    ['WC2026-M81', 'Sechzehntelfinale', '1. Gruppe D', '3. B/E/F/I/J', '2026-07-02 02:00:00', 'San Francisco'],
    ['WC2026-M82', 'Sechzehntelfinale', '1. Gruppe G', '3. A/E/H/I/J', '2026-07-01 22:00:00', 'Seattle'],
    ['WC2026-M83', 'Sechzehntelfinale', '2. Gruppe K', '2. Gruppe L', '2026-07-03 01:00:00', 'Toronto'],
    ['WC2026-M84', 'Sechzehntelfinale', '1. Gruppe H', '2. Gruppe J', '2026-07-02 21:00:00', 'Los Angeles'],
    ['WC2026-M85', 'Sechzehntelfinale', '1. Gruppe B', '3. E/F/G/I/J', '2026-07-03 05:00:00', 'Vancouver'],
    ['WC2026-M86', 'Sechzehntelfinale', '1. Gruppe J', '2. Gruppe H', '2026-07-04 00:00:00', 'Miami'],
    ['WC2026-M87', 'Sechzehntelfinale', '1. Gruppe K', '3. D/E/I/J/L', '2026-07-04 03:30:00', 'Kansas City'],
    ['WC2026-M88', 'Sechzehntelfinale', '2. Gruppe D', '2. Gruppe G', '2026-07-03 20:00:00', 'Dallas'],
    ['WC2026-M89', 'Achtelfinale', 'Sieger 74', 'Sieger 77', '2026-07-04 23:00:00', 'Philadelphia'],
    ['WC2026-M90', 'Achtelfinale', 'Sieger 73', 'Sieger 75', '2026-07-04 19:00:00', 'Houston'],
    ['WC2026-M91', 'Achtelfinale', 'Sieger 76', 'Sieger 78', '2026-07-05 22:00:00', 'NY/New Jersey'],
    ['WC2026-M92', 'Achtelfinale', 'Sieger 79', 'Sieger 80', '2026-07-06 02:00:00', 'Mexico-Stadt'],
    ['WC2026-M93', 'Achtelfinale', 'Sieger 83', 'Sieger 84', '2026-07-06 21:00:00', 'Dallas'],
    ['WC2026-M94', 'Achtelfinale', 'Sieger 81', 'Sieger 82', '2026-07-07 02:00:00', 'Seattle'],
    ['WC2026-M95', 'Achtelfinale', 'Sieger 86', 'Sieger 88', '2026-07-07 18:00:00', 'Atlanta'],
    ['WC2026-M96', 'Achtelfinale', 'Sieger 85', 'Sieger 87', '2026-07-07 22:00:00', 'Vancouver'],
    ['WC2026-M97', 'Viertelfinale', 'Sieger 89', 'Sieger 90', '2026-07-09 22:00:00', 'Boston'],
    ['WC2026-M98', 'Viertelfinale', 'Sieger 93', 'Sieger 94', '2026-07-10 21:00:00', 'Los Angeles'],
    ['WC2026-M99', 'Viertelfinale', 'Sieger 91', 'Sieger 92', '2026-07-11 23:00:00', 'Miami'],
    ['WC2026-M100', 'Viertelfinale', 'Sieger 95', 'Sieger 96', '2026-07-12 03:00:00', 'Kansas City'],
    ['WC2026-M101', 'Halbfinale', 'Sieger 97', 'Sieger 98', '2026-07-14 21:00:00', 'Dallas'],
    ['WC2026-M102', 'Halbfinale', 'Sieger 99', 'Sieger 100', '2026-07-15 21:00:00', 'Atlanta'],
    ['WC2026-M103', 'Spiel um Platz 3', 'Verlierer 101', 'Verlierer 102', '2026-07-18 23:00:00', 'Miami'],
    ['WC2026-M104', 'Finale', 'Sieger 101', 'Sieger 102', '2026-07-19 21:00:00', 'NY/New Jersey'],
  ];
}

