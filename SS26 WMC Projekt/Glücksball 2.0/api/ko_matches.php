<?php
// Erzwingt strikte Typprüfung (verhindert ungewollte Typumwandlungen)
declare(strict_types=1);

// Startet die PHP-Session (z. B. für Login / Benutzerstatus notwendig)
session_start();

// Setzt den Response-Header auf JSON mit UTF-8
header('Content-Type: application/json; charset=utf-8');

// Bindet die Datenbankverbindung ($pdo) ein
require_once __DIR__ . '/db.php';

// Hilfsfunktion für einheitliche JSON-Antworten
function out(array $p, int $c = 200): void {
  // HTTP-Statuscode setzen (z. B. 200 OK, 500 Server Error)
  http_response_code($c);

  // JSON ausgeben (Umlaute bleiben lesbar)
  echo json_encode($p, JSON_UNESCAPED_UNICODE);

  // Script sofort beenden
  exit;
}

// ID des Turniers (z. B. AFCON = 1)
$tournamentId = 1;

try {
  // Prepared Statement zum Laden aller KO-Spiele
  // group_id IS NULL → keine Gruppenspiele, nur K.-o.-Runden
  $stmt = $pdo->prepare("
    SELECT
      m.id,                 -- Match-ID
      m.match_date,         -- Datum & Uhrzeit (DATETIME)
      m.status,             -- Spielstatus (scheduled, finished, etc.)
      ht.name AS home_name, -- Name Heimteam
      at.name AS away_name  -- Name Auswärtsteam
    FROM matches m
    -- Join auf Heimteam-Tabelle
    JOIN teams ht ON ht.id = m.home_team_id
    -- Join auf Auswärtsteam-Tabelle
    JOIN teams at ON at.id = m.away_team_id
    WHERE m.tournament_id = :tid -- Nur gewünschtes Turnier
      AND m.group_id IS NULL     -- Nur KO-Runden
    ORDER BY m.match_date ASC, m.id ASC -- Sortierung nach Datum
  ");

  // Übergibt die Turnier-ID sicher an das Prepared Statement
  $stmt->execute([":tid" => $tournamentId]);

  // Erfolgreiche Antwort mit allen gefundenen Spielen
  out([
    "ok" => true,
    "matches" => $stmt->fetchAll(PDO::FETCH_ASSOC)
  ]);

} catch (Throwable $e) {
  // Fehlerfall (z. B. SQL- oder Verbindungsfehler)
  out([
    "ok" => false,
    "error" => "DB error: " . $e->getMessage()
  ], 500);
}
