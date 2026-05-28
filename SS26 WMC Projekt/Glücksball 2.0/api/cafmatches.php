<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function out(array $p, int $c = 200): void {
  http_response_code($c);
  echo json_encode($p, JSON_UNESCAPED_UNICODE);
  exit;
}

try {

  $sql = "
    SELECT
      id,
      home_team,
      away_team,
      match_date,
      status
    FROM matches
    WHERE tournament_id = 2
      AND status = 'scheduled'
    ORDER BY match_date ASC
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute();

  out([
    "ok" => true,
    "matches" => $stmt->fetchAll(PDO::FETCH_ASSOC)
  ]);

} catch (Throwable $e) {

  out([
    "ok" => false,
    "error" => $e->getMessage()
  ], 500);

}
?>