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
  // Speichert den WM-Favoriten pro User und die später automatisch berechneten Bonuspunkte.
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

function ensure_wm_result_table(PDO $pdo): void {
  // Top-Torjäger kann nicht aus den vorhandenen Spieldaten berechnet werden und wird hier nach WM-Ende eingetragen.
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS wm_results (
      id TINYINT PRIMARY KEY DEFAULT 1,
      top_scorer VARCHAR(120) DEFAULT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

function normalize_text(string $value): string {
  return mb_strtolower(trim($value), 'UTF-8');
}

function wm_final_result(PDO $pdo): ?array {
  // Der Weltmeister wird erst aus dem fertigen Finale gelesen. Vorher gibt diese Funktion null zurück.
  $stmt = $pdo->query("
    SELECT team_home, team_away, score_home, score_away, status
    FROM spiele
    WHERE competition = 'WM 2026'
      AND aktiv = 1
      AND group_name = 'Finale'
    ORDER BY date DESC, id DESC
    LIMIT 1
  ");
  $final = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$final || $final['status'] !== 'finished' || $final['score_home'] === null || $final['score_away'] === null) {
    return null;
  }

  $homeGoals = (int)$final['score_home'];
  $awayGoals = (int)$final['score_away'];
  if ($homeGoals === $awayGoals) {
    return null;
  }

  return [
    'champion' => $homeGoals > $awayGoals ? (string)$final['team_home'] : (string)$final['team_away'],
  ];
}

function wm_all_matches_finished(PDO $pdo): bool {
  // WM-Favorit-Bonuspunkte und Hall of Fame werden erst freigegeben, wenn kein aktives WM-Spiel mehr offen ist.
  $stmt = $pdo->query("
    SELECT COUNT(*) AS open_matches
    FROM spiele
    WHERE competition = 'WM 2026'
      AND aktiv = 1
      AND (
        status <> 'finished'
        OR score_home IS NULL
        OR score_away IS NULL
      )
  ");
  return (int)($stmt->fetch(PDO::FETCH_ASSOC)['open_matches'] ?? 0) === 0;
}

function wm_total_goals(PDO $pdo): int {
  $stmt = $pdo->query("
    SELECT COALESCE(SUM(score_home + score_away), 0) AS total_goals
    FROM spiele
    WHERE competition = 'WM 2026'
      AND aktiv = 1
      AND status = 'finished'
      AND score_home IS NOT NULL
      AND score_away IS NOT NULL
  ");
  return (int)($stmt->fetch(PDO::FETCH_ASSOC)['total_goals'] ?? 0);
}

function wm_actual_top_scorer(PDO $pdo): string {
  $stmt = $pdo->query("SELECT top_scorer FROM wm_results WHERE id = 1 LIMIT 1");
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  return trim((string)($row['top_scorer'] ?? ''));
}

function refresh_wm_favorite_points(PDO $pdo): array {
  // Wichtig: Vor WM-Ende werden alle Favorit-Bonuspunkte auf 0 gehalten.
  // Erst nach dem letzten fertigen Spiel werden Champion, Top-Torjäger und Gesamt-Tore bewertet.
  $complete = wm_all_matches_finished($pdo);
  $final = $complete ? wm_final_result($pdo) : null;
  $champion = (string)($final['champion'] ?? '');
  $totalGoals = $complete ? wm_total_goals($pdo) : 0;
  $topScorer = $complete ? wm_actual_top_scorer($pdo) : '';

  if (!$complete || $champion === '') {
    $pdo->exec("
      UPDATE wm_favorites
      SET points_champion = 0,
          points_top_scorer = 0,
          points_total_goals = 0
    ");

    return [
      'complete' => false,
      'champion' => null,
      'top_scorer' => null,
      'total_goals' => null,
    ];
  }

  $stmt = $pdo->prepare("
    UPDATE wm_favorites
    SET points_champion = CASE WHEN champion_team = :champion THEN 25 ELSE 0 END,
        points_top_scorer = CASE
          WHEN :top_scorer <> '' AND LOWER(top_scorer) = LOWER(:top_scorer) THEN 25
          ELSE 0
        END,
        points_total_goals = CASE WHEN total_goals = :total_goals THEN 25 ELSE 0 END
  ");
  $stmt->execute([
    ':champion' => $champion,
    ':top_scorer' => $topScorer,
    ':total_goals' => $totalGoals,
  ]);

  return [
    'complete' => true,
    'champion' => $champion,
    'top_scorer' => $topScorer !== '' ? $topScorer : null,
    'total_goals' => $totalGoals,
  ];
}

try {
  ensure_favorite_table($pdo);
  ensure_wm_result_table($pdo);
  $wmFavoriteResult = refresh_wm_favorite_points($pdo);

  $sql = "
    /* Ehren-Ranking:
       - exakt richtig = 3 Punkte
       - richtige Tendenz = 1 Punkt
       - WM-Favorit-Bonus kommt erst nach WM-Ende dazu
       - Gleichstand: Punkte, exakte Tipps, weniger Tipps, Username
    */
    SELECT
      u.id AS user_id,
      u.username AS display_name,

      COALESCE(COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN t.spiel_id END), 0) AS tips,
      COALESCE(COUNT(DISTINCT CASE WHEN s.status = 'finished' THEN t.spiel_id END), 0) AS finished_tips,
      COALESCE(COUNT(DISTINCT CASE
        WHEN s.status = 'finished'
         AND t.tipp_home = s.score_home
         AND t.tipp_away = s.score_away
        THEN t.spiel_id
      END), 0) AS exact_tips,
      COALESCE(COUNT(DISTINCT CASE
        WHEN s.status = 'finished'
         AND (
          (t.tipp_home = s.score_home AND t.tipp_away = s.score_away) OR
          (t.tipp_home > t.tipp_away AND s.score_home > s.score_away) OR
          (t.tipp_home < t.tipp_away AND s.score_home < s.score_away) OR
          (t.tipp_home = t.tipp_away AND s.score_home = s.score_away)
         )
        THEN t.spiel_id
      END), 0) AS hits,

      (
        COALESCE(SUM(
        CASE
          WHEN s.id IS NULL THEN 0

          WHEN s.status = 'finished'
           AND t.tipp_home = s.score_home
           AND t.tipp_away = s.score_away
          THEN 3

          WHEN s.status = 'finished' AND (
            (t.tipp_home > t.tipp_away AND s.score_home > s.score_away) OR
            (t.tipp_home < t.tipp_away AND s.score_home < s.score_away) OR
            (t.tipp_home = t.tipp_away AND s.score_home = s.score_away)
          )
          THEN 1

          ELSE 0
        END
        ), 0)
        + COALESCE(MAX(f.points_champion + f.points_top_scorer + f.points_total_goals), 0)
      ) AS points

    FROM users u

    LEFT JOIN tipps t
      ON t.user_id = u.id

    LEFT JOIN spiele s
      ON s.id = t.spiel_id
     AND s.competition = 'WM 2026'
     AND s.aktiv = 1

    LEFT JOIN wm_favorites f
      ON f.user_id = u.id

    WHERE LOWER(u.username) <> 'admin'

    GROUP BY u.id, u.username
    ORDER BY points DESC, exact_tips DESC, tips ASC, u.username ASC
  ";

  $stmt = $pdo->query($sql);
  $rankingRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $favoritesStmt = $pdo->query("
    SELECT
      u.id AS user_id,
      u.username AS display_name,
      f.champion_team,
      f.top_scorer,
      f.total_goals,
      f.points_champion,
      f.points_top_scorer,
      f.points_total_goals
    FROM wm_favorites f
    JOIN users u ON u.id = f.user_id
    WHERE LOWER(u.username) <> 'admin'
    ORDER BY u.username ASC
  ");

  out([
    'ok' => true,
    'scope' => 'Ehrentipps',
    'competition' => 'WM 2026',
    'wmFavoriteResult' => $wmFavoriteResult,
    'ranking' => $rankingRows,
    'hall_of_fame' => $wmFavoriteResult['complete'] ? array_slice($rankingRows, 0, 3) : [],
    'favorites' => $favoritesStmt->fetchAll(PDO::FETCH_ASSOC),
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
