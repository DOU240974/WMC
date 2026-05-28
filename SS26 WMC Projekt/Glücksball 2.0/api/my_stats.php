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

function calc_points(?int $ph, ?int $pa, ?int $rh, ?int $ra, string $status): int {
  if ($status !== 'finished' || $rh === null || $ra === null || $ph === null || $pa === null) return 0;
  if ($ph === $rh && $pa === $ra) return 3;

  $predDiff = $ph - $pa;
  $realDiff = $rh - $ra;
  if ($predDiff === 0 && $realDiff === 0) return 1;
  if (($predDiff > 0 && $realDiff > 0) || ($predDiff < 0 && $realDiff < 0)) return 1;

  return 0;
}

function load_tips(PDO $pdo, int $userId): array {
  $stmt = $pdo->prepare("
    SELECT
      s.id,
      s.match_id,
      s.competition,
      s.team_home,
      s.team_away,
      s.date,
      s.score_home,
      s.score_away,
      s.status,
      t.tipp_home,
      t.tipp_away
    FROM tipps t
    JOIN spiele s ON s.id = t.spiel_id
    WHERE t.user_id = :uid
      AND s.aktiv = 1
    ORDER BY s.date ASC, s.id ASC
  ");
  $stmt->execute([':uid' => $userId]);

  $items = [];
  foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $ph = $row['tipp_home'] !== null ? (int)$row['tipp_home'] : null;
    $pa = $row['tipp_away'] !== null ? (int)$row['tipp_away'] : null;
    $rh = $row['score_home'] !== null ? (int)$row['score_home'] : null;
    $ra = $row['score_away'] !== null ? (int)$row['score_away'] : null;
    $status = (string)($row['status'] ?? 'upcoming');

    $items[] = [
      'match_id' => (string)($row['match_id'] ?? $row['id']),
      'competition' => (string)($row['competition'] ?? ''),
      'date' => (string)$row['date'],
      'home' => (string)$row['team_home'],
      'away' => (string)$row['team_away'],
      'pred_home' => $ph,
      'pred_away' => $pa,
      'home_goals' => $rh,
      'away_goals' => $ra,
      'status' => $status,
      'points' => calc_points($ph, $pa, $rh, $ra, $status),
    ];
  }

  return $items;
}

function is_fun_tip(array $item): bool {
  return trim((string)($item['competition'] ?? '')) === 'Freundschaftsspiel';
}

if (!isset($_SESSION['user_id'])) {
  out(['ok' => false, 'error' => 'Not logged in'], 401);
}

try {
  $userId = (int)$_SESSION['user_id'];

  $userStmt = $pdo->prepare("SELECT id, username, email FROM users WHERE id = :id LIMIT 1");
  $userStmt->execute([':id' => $userId]);
  $user = $userStmt->fetch(PDO::FETCH_ASSOC);
  if (!$user) out(['ok' => false, 'error' => 'User not found'], 404);

  $allItems = load_tips($pdo, $userId);
  $honorItems = [];
  $funItems = [];

  foreach ($allItems as $item) {
    if (is_fun_tip($item)) {
      $funItems[] = $item;
    } else {
      $honorItems[] = $item;
    }
  }

  $finished = 0;
  $exact = 0;
  $tendency = 0;
  $wrong = 0;
  $points = 0;

  foreach ($honorItems as $item) {
    if ($item['status'] !== 'finished') continue;
    $finished++;
    $points += (int)$item['points'];
    if ((int)$item['points'] === 3) $exact++;
    else if ((int)$item['points'] === 1) $tendency++;
    else $wrong++;
  }

  out([
    'ok' => true,
    'user' => [
      'id' => (int)$user['id'],
      'username' => (string)$user['username'],
      'email' => (string)$user['email'],
    ],
    'summary' => [
      'total_bets' => count($allItems),
      'honor_bets' => count($honorItems),
      'fun_bets' => count($funItems),
      'finished_matches' => $finished,
      'exact' => $exact,
      'tendency' => $tendency,
      'wrong' => $wrong,
      'points' => $points,
    ],
    'items' => $honorItems,
    'honorItems' => $honorItems,
    'funItems' => $funItems,
  ]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
