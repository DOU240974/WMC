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

  $stmt = $pdo->query("
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
      AND date >= NOW()
      AND competition IN ('WM 2026', 'Freundschaftsspiel')
      AND (
        match_id LIKE 'WC2026-M%'
        OR match_id LIKE 'FRI-2026-%'
      )
    ORDER BY date ASC, id ASC
    LIMIT 4
  ");

  out([
    'ok' => true,
    'matches' => $stmt->fetchAll(PDO::FETCH_ASSOC),
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
