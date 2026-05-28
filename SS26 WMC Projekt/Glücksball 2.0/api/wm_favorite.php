<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function ensure_favorite_table(PDO $pdo): void {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS wm_favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      champion_team VARCHAR(120) NOT NULL,
      top_scorer VARCHAR(120) NOT NULL,
      total_goals INT NOT NULL,
      points_champion INT NOT NULL DEFAULT 0,
      points_top_scorer INT NOT NULL DEFAULT 0,
      points_total_goals INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_wm_favorites_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

function wm_meta(PDO $pdo): array {
  $teamsStmt = $pdo->query("
    SELECT team_name
    FROM (
      SELECT team_home AS team_name FROM spiele WHERE competition = 'WM 2026' AND aktiv = 1
      UNION
      SELECT team_away AS team_name FROM spiele WHERE competition = 'WM 2026' AND aktiv = 1
    ) teams
    WHERE team_name IS NOT NULL AND team_name <> ''
    ORDER BY team_name ASC
  ");

  $deadlineStmt = $pdo->query("
    SELECT MIN(date) AS first_match
    FROM spiele
    WHERE competition = 'WM 2026'
      AND aktiv = 1
      AND date IS NOT NULL
  ");

  $teams = array_map(fn($row) => (string)$row['team_name'], $teamsStmt->fetchAll(PDO::FETCH_ASSOC));
  $deadline = (string)($deadlineStmt->fetch(PDO::FETCH_ASSOC)['first_match'] ?? '');
  $locked = $deadline !== '' && strtotime($deadline) !== false && strtotime($deadline) <= time();

  return [
    'teams' => $teams,
    'deadline' => $deadline,
    'locked' => $locked,
  ];
}

try {
  ensure_favorite_table($pdo);

  $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
  $meta = wm_meta($pdo);

  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $favorite = null;
    if ($userId > 0) {
      $stmt = $pdo->prepare("
        SELECT champion_team, top_scorer, total_goals,
               points_champion, points_top_scorer, points_total_goals
        FROM wm_favorites
        WHERE user_id = :uid
        LIMIT 1
      ");
      $stmt->execute([':uid' => $userId]);
      $favorite = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    out([
      'ok' => true,
      'loggedIn' => $userId > 0,
      'teams' => $meta['teams'],
      'deadline' => $meta['deadline'],
      'locked' => $meta['locked'],
      'favorite' => $favorite,
    ]);
  }

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    out(['ok' => false, 'error' => 'Methode nicht erlaubt.'], 405);
  }

  if ($userId <= 0) {
    out(['ok' => false, 'error' => 'Bitte zuerst einloggen.'], 401);
  }

  if ($meta['locked']) {
    out(['ok' => false, 'error' => 'WM-Favorit ist bereits gesperrt.'], 403);
  }

  $data = json_decode((string)file_get_contents('php://input'), true);
  if (!is_array($data)) {
    out(['ok' => false, 'error' => 'Ungültiges JSON.'], 400);
  }

  $champion = trim((string)($data['champion_team'] ?? ''));
  $topScorer = trim((string)($data['top_scorer'] ?? ''));
  $goalsRaw = $data['total_goals'] ?? null;

  if ($champion === '' || !in_array($champion, $meta['teams'], true)) {
    out(['ok' => false, 'error' => 'Bitte ein Land auswählen.'], 400);
  }

  if ($topScorer === '' || mb_strlen($topScorer, 'UTF-8') > 120) {
    out(['ok' => false, 'error' => 'Bitte einen Top-Torjäger eintragen.'], 400);
  }

  if (!is_numeric($goalsRaw)) {
    out(['ok' => false, 'error' => 'Bitte die gesamte Toranzahl als Zahl eintragen.'], 400);
  }

  $totalGoals = (int)$goalsRaw;
  if ($totalGoals < 0 || $totalGoals > 400) {
    out(['ok' => false, 'error' => 'Die Toranzahl wirkt unrealistisch.'], 400);
  }

  $stmt = $pdo->prepare("
    INSERT INTO wm_favorites (user_id, champion_team, top_scorer, total_goals)
    VALUES (:uid, :champion, :scorer, :goals)
    ON DUPLICATE KEY UPDATE
      champion_team = VALUES(champion_team),
      top_scorer = VALUES(top_scorer),
      total_goals = VALUES(total_goals),
      updated_at = CURRENT_TIMESTAMP
  ");
  $stmt->execute([
    ':uid' => $userId,
    ':champion' => $champion,
    ':scorer' => $topScorer,
    ':goals' => $totalGoals,
  ]);

  out([
    'ok' => true,
    'favorite' => [
      'champion_team' => $champion,
      'top_scorer' => $topScorer,
      'total_goals' => $totalGoals,
    ],
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
