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

try {
  ensure_favorite_table($pdo);

  $sql = "
    SELECT
      u.id AS user_id,
      u.username AS display_name,

      COALESCE(COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN t.spiel_id END), 0) AS tips,
      COALESCE(COUNT(DISTINCT CASE WHEN s.status = 'finished' THEN t.spiel_id END), 0) AS finished_tips,
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

    GROUP BY u.id, u.username
    ORDER BY points DESC, tips DESC, u.username ASC
  ";

  $stmt = $pdo->query($sql);
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
    ORDER BY u.username ASC
  ");

  out([
    'ok' => true,
    'scope' => 'Ehrentipps',
    'competition' => 'WM 2026',
    'ranking' => $stmt->fetchAll(PDO::FETCH_ASSOC),
    'favorites' => $favoritesStmt->fetchAll(PDO::FETCH_ASSOC),
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
