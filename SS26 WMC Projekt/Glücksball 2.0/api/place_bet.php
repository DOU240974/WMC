<?php
// =========================================================
// place_bet.php (FINAL / ROBUST)
// - match_id als STRING (z.B. "QF1")
// - akzeptiert mehrere Key-Namen vom Frontend:
//     match_id | id | matchId | mid | match
// - akzeptiert Tore als:
//     pred_home/pred_away ODER home_goals/away_goals
// - Lock nach Anpfiff aus data/afcon.json (KO-Baum)
// - speichert in bets: pred_home, pred_away
// - UPSERT braucht UNIQUE(user_id, match_id)
// =========================================================

declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_guard.php';

// ----------------------------
// Helper: JSON antworten
// ----------------------------
function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

// ----------------------------
// Login required
// ----------------------------
$userId = require_approved_user($pdo);

// ----------------------------
// Request JSON lesen
// ----------------------------
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
  out(["ok" => false, "error" => "Invalid JSON body"], 400);
}

// ----------------------------
// match_id robust lesen
// (weil dein Frontend aktuell KEIN match_id schickt oder es anders heißt)
// ----------------------------
$matchId = trim((string)(
  $data["match_id"] ??
  $data["id"] ??
  $data["matchId"] ??
  $data["mid"] ??
  $data["match"] ??
  ""
));

// ----------------------------
// Tore robust lesen
// ----------------------------
$predHomeRaw = $data["pred_home"] ?? ($data["home_goals"] ?? null);
$predAwayRaw = $data["pred_away"] ?? ($data["away_goals"] ?? null);

// ----------------------------
// Validierung: match_id muss vorhanden sein
// ----------------------------
if ($matchId === "") {
  out([
    "ok" => false,
    "error" => "Invalid payload (match_id missing)",
    "debug" => [
      "received_keys" => array_keys($data),
      "raw" => $raw
    ]
  ], 400);
}

// ----------------------------
// Validierung: Tore müssen numerisch sein
// ----------------------------
if (!is_numeric($predHomeRaw) || !is_numeric($predAwayRaw)) {
  out([
    "ok" => false,
    "error" => "Invalid payload (scores must be numeric)",
    "debug" => [
      "match_id" => $matchId,
      "pred_home_raw" => $predHomeRaw,
      "pred_away_raw" => $predAwayRaw,
      "received_keys" => array_keys($data),
      "raw" => $raw
    ]
  ], 400);
}

$predHome = (int)$predHomeRaw;
$predAway = (int)$predAwayRaw;

// Plausibilität
if ($predHome < 0 || $predAway < 0 || $predHome > 20 || $predAway > 20) {
  out(["ok" => false, "error" => "Unrealistic score"], 400);
}

// =========================================================
// Kickoff Lock aus data/afcon.json (KO Baum)
// =========================================================
function findKickoff(string $matchId): ?DateTime {
  $jsonPath = __DIR__ . "/../data/afcon.json";
  if (!file_exists($jsonPath)) return null;

  $afcon = json_decode(file_get_contents($jsonPath), true);
  if (!is_array($afcon)) return null;

  if (!isset($afcon["knockout"]) || !is_array($afcon["knockout"])) return null;

  foreach ($afcon["knockout"] as $round) {
    foreach (($round["matches"] ?? []) as $m) {
      if (($m["id"] ?? "") === $matchId) {
        $date = $m["date"] ?? null;
        $time = $m["time"] ?? null;
        if (!$date || !$time) return null;

        $tz = new DateTimeZone("Europe/Vienna");
        return new DateTime($date . " " . $time, $tz);
      }
    }
  }
  return null;
}

$kickoff = findKickoff($matchId);
if ($kickoff) {
  $now = new DateTime("now", new DateTimeZone("Europe/Vienna"));
  if ($now >= $kickoff) {
    out(["ok" => false, "error" => "Bet locked (match already started)"], 403);
  }
}

// =========================================================
// Optional: Match existiert?
// (Wenn du das nicht willst: Block rauslöschen)
// =========================================================
try {
  $check = $pdo->prepare("SELECT id FROM matches WHERE id = :mid LIMIT 1");
  $check->execute([":mid" => $matchId]);
  if (!$check->fetch()) {
    out(["ok" => false, "error" => "Unknown match_id: " . $matchId], 404);
  }
} catch (Throwable $e) {
  out(["ok" => false, "error" => "DB error (match check): " . $e->getMessage()], 500);
}

// =========================================================
// Speichern (UPSERT)
// Tabelle bets: user_id, match_id, pred_home, pred_away
// =========================================================
$sql = "
INSERT INTO bets (user_id, match_id, pred_home, pred_away, created_at, updated_at)
VALUES (:uid, :mid, :ph, :pa, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  pred_home = VALUES(pred_home),
  pred_away = VALUES(pred_away),
  updated_at = NOW()
";

try {
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ":uid" => $userId,
    ":mid" => $matchId,
    ":ph"  => $predHome,
    ":pa"  => $predAway
  ]);
} catch (Throwable $e) {
  out(["ok" => false, "error" => "DB error (save bet): " . $e->getMessage()], 500);
}

// Erfolg
out([
  "ok" => true,
  "saved" => [
    "user_id" => $userId,
    "match_id" => $matchId,
    "pred_home" => $predHome,
    "pred_away" => $predAway
  ]
]);
