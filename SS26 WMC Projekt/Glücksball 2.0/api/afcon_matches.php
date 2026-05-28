<?php
// Strikte Typprüfung aktivieren (verhindert implizite Typumwandlungen)
declare(strict_types=1);

// PHP-Session starten (z. B. für Login-Status relevant)
session_start();

// Antwort-Header: JSON-Ausgabe mit UTF-8 Zeichensatz
header('Content-Type: application/json; charset=utf-8');

// Datenbankverbindung einbinden ($pdo)
require_once __DIR__ . '/db.php';

// Hilfsfunktion für konsistente JSON-Antworten
function out(array $payload, int $code = 200): void {
  // HTTP-Statuscode setzen (z. B. 200, 400, 500)
  http_response_code($code);

  // Array als JSON ausgeben
  echo json_encode($payload);

  // Script sofort beenden
  exit;
}

try {
  // SQL-Abfrage:
  // Es werden nur KO-Spiele geladen → group_id IS NULL
  $stmt = $pdo->query("
    SELECT
      m.id,                 -- Match-ID
      m.match_date,         -- Datum/Zeit des Spiels
      m.status,             -- Status (z. B. scheduled, finished)
      ht.name AS home_name, -- Name Heimteam
      at.name AS away_name  -- Name Auswärtsteam
    FROM matches m
    -- Join auf Heimteam
    JOIN teams ht ON ht.id = m.home_team_id
    -- Join auf Auswärtsteam
    JOIN teams at ON at.id = m.away_team_id
    WHERE m.tournament_id = 1   -- Nur bestimmtes Turnier (z. B. AFCON)
      AND m.group_id IS NULL    -- Nur KO-Runden (keine Gruppenspiele)
    ORDER BY m.match_date ASC, m.id ASC -- Sortierung nach Datum
  ");

  // Alle Ergebnisse als assoziatives Array holen
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Erfolgreiche Antwort an das Frontend
  // Frontend erwartet ein Array unter "matches"
  out([
    "ok" => true,
    "matches" => $rows
  ]);

} catch (Throwable $e) {
  // Fehlerfall: Datenbank- oder PHP-Fehler abfangen
  out([
    "ok" => false,
    "error" => "DB error: " . $e->getMessage()
  ], 500);
}
