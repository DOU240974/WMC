<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_guard.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json_body(): array {
  $data = json_decode((string)file_get_contents('php://input'), true);
  if (!is_array($data)) {
    out(['ok' => false, 'error' => 'Ungültiges JSON.'], 400);
  }
  return $data;
}

function valid_score(mixed $value): bool {
  return is_numeric($value) && (int)$value >= 0 && (int)$value <= 20;
}

try {
  $userId = require_approved_user($pdo);

  $data = read_json_body();
  $spielId = (int)($data['spiel_id'] ?? 0);
  $homeRaw = $data['tipp_home'] ?? null;
  $awayRaw = $data['tipp_away'] ?? null;

  if ($spielId <= 0 || !valid_score($homeRaw) || !valid_score($awayRaw)) {
    out(['ok' => false, 'error' => 'Bitte gültige Tore eingeben.'], 400);
  }

  $match = $pdo->prepare("
    SELECT id, date
    FROM spiele
    WHERE id = :id
      AND competition = 'Freundschaftsspiel'
      AND aktiv = 1
    LIMIT 1
  ");
  $match->execute([':id' => $spielId]);
  $row = $match->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    out(['ok' => false, 'error' => 'Spiel nicht gefunden.'], 404);
  }

  if (!empty($row['date']) && strtotime((string)$row['date']) !== false && strtotime((string)$row['date']) <= time()) {
    out(['ok' => false, 'error' => 'Tippabgabe ist für dieses Spiel gesperrt.'], 403);
  }

  $stmt = $pdo->prepare("
    INSERT INTO tipps (user_id, spiel_id, tipp_home, tipp_away, points)
    VALUES (:uid, :spiel, :home, :away, 0)
    ON DUPLICATE KEY UPDATE
      tipp_home = VALUES(tipp_home),
      tipp_away = VALUES(tipp_away)
  ");
  $stmt->execute([
    ':uid' => $userId,
    ':spiel' => $spielId,
    ':home' => (int)$homeRaw,
    ':away' => (int)$awayRaw,
  ]);

  out(['ok' => true]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
