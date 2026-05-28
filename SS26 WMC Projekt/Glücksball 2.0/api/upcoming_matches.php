<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $stmt = $pdo->query("
    SELECT
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
    ORDER BY date ASC, id ASC
    LIMIT 8
  ");

  out([
    'ok' => true,
    'matches' => $stmt->fetchAll(PDO::FETCH_ASSOC),
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}

