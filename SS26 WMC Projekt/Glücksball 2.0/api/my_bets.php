<?php
// Erzwingt strikte Typisierung
declare(strict_types=1);

// Startet die Session (für Zugriff auf Login-Daten)
session_start();

// Setzt den Response-Header auf JSON mit UTF-8
header('Content-Type: application/json; charset=utf-8');

// Bindet die Datenbankverbindung ($pdo) ein
require_once __DIR__ . '/db.php';

// Hilfsfunktion für einheitliche JSON-Antworten
function out(array $p, int $c = 200): void {
  // HTTP-Statuscode setzen
  http_response_code($c);

  // Antwort als JSON ausgeben (Umlaute bleiben lesbar)
  echo json_encode($p, JSON_UNESCAPED_UNICODE);

  // Script sofort beenden
  exit;
}

// Prüft, ob der User eingeloggt ist
if (!isset($_SESSION['user_id'])) {
  // Nicht eingeloggt → Zugriff verweigern
  out(["ok" => false, "error" => "Not logged in"], 401);
}

// User-ID aus der Session holen
$userId = (int)$_SESSION['user_id'];

// Turnier-ID (AFCON = 1)
$tournamentId = 1;

try {
  // SQL-Abfrage:
  // Lädt alle Tipps (Bets) des eingeloggten Users
  // für das angegebene Turnier
  $sql = "
    SELECT
      b.match_id,     -- ID des Spiels
      b.pred_home,    -- Tipp Heimteam-Tore
      b.pred_away,    -- Tipp Auswärtsteam-Tore
      b.updated_at    -- Zeitpunkt der letzten Änderung
    FROM bets b
    -- Join mit matches, um nach Turnier filtern zu können
    JOIN matches m ON m.id = b.match_id
    WHERE b.user_id = :uid        -- Nur Tipps des Users
      AND m.tournament_id = :tid  -- Nur Tipps dieses Turniers
    ORDER BY b.match_id ASC       -- Sortierung nach Spiel-ID
  ";

  // Prepared Statement vorbereiten
  $stmt = $pdo->prepare($sql);

  // Parameter sicher binden und Abfrage ausführen
  $stmt->execute([
    ":uid" => $userId,
    ":tid" => $tournamentId
  ]);

  // Erfolgreiche Antwort mit allen Tipps
  out([
    "ok" => true,
    "bets" => $stmt->fetchAll(PDO::FETCH_ASSOC)
  ]);

} catch (Throwable $e) {
  // Fehlerfall (z. B. SQL- oder DB-Fehler)
  out([
    "ok" => false,
    "error" => "DB error: " . $e->getMessage()
  ], 500);
}
