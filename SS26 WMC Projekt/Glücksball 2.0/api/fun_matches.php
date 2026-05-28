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

try {
  $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

  $stmt = $pdo->prepare("
    SELECT
      s.id,
      s.match_id,
      s.group_name,
      s.team_home,
      s.team_away,
      s.date,
      s.url AS venue,
      t.tipp_home,
      t.tipp_away
    FROM spiele s
    LEFT JOIN tipps t
      ON t.spiel_id = s.id
     AND t.user_id = :uid
    WHERE s.competition = 'Freundschaftsspiel'
      AND s.aktiv = 1
    ORDER BY s.date ASC, s.id ASC
  ");
  $stmt->execute([':uid' => $userId]);

  out([
    'ok' => true,
    'loggedIn' => $userId > 0,
    'matches' => $stmt->fetchAll(PDO::FETCH_ASSOC),
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}

