<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/match_seed_v2.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  ensure_match_seed($pdo);

  $sql = "
    SELECT
      match_id,
      team_home,
      team_away,
      date,
      competition,
      url AS venue
    FROM spiele
    WHERE aktiv = 1
      AND date IS NOT NULL
      AND competition IN ('WM 2026', 'Freundschaftsspiel')
      AND (
        match_id LIKE 'WC2026-M%'
        OR match_id LIKE 'FRI-2026-%'
      )
  ";

  $stmt = $pdo->query($sql . "
      AND date >= NOW()
    ORDER BY date ASC, id ASC
    LIMIT 5
  ");
  $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);

  if (count($matches) < 5) {
    $stmt = $pdo->query($sql . "
    ORDER BY date ASC, id ASC
    LIMIT 5
    ");
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  if (count($matches) < 5) {
    $seen = [];
    foreach ($matches as $match) {
      $seen[(string)($match['match_id'] ?? '')] = true;
    }

    foreach (official_world_cup_group_matches() as $seed) {
      if (count($matches) >= 5) break;
      if (isset($seen[$seed[0]])) continue;

      $matches[] = [
        'match_id' => $seed[0],
        'team_home' => $seed[2],
        'team_away' => $seed[3],
        'date' => $seed[4],
        'competition' => 'WM 2026',
        'venue' => $seed[5],
      ];
      $seen[$seed[0]] = true;
    }
  }

  out([
    'ok' => true,
    'matches' => $matches,
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}

