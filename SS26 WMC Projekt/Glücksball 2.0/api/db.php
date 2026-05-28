<?php
// Strikte Typisierung aktivieren (sauberer, weniger Fehler)
declare(strict_types=1);

/*
  db.php
  Diese Datei ist AUSSCHLIESSLICH für die Datenbankverbindung zuständig.
  ✔ kein session_start()
  ✔ keine HTML-Ausgaben
  ✔ keine echo-Ausgaben (außer im Fehlerfall als JSON)
*/

// Datenbank-Host (lokaler Server, z. B. XAMPP)
$DB_HOST = "127.0.0.1";

// Name der Datenbank (an dein Projekt angepasst)
$DB_NAME = "gbdatenbank";

// Datenbank-Benutzer (XAMPP-Standard: root)
$DB_USER = "root";

// Passwort (bei XAMPP meist leer)
$DB_PASS = "";

// Zeichensatz für saubere UTF-8-Unterstützung (Umlaute, Sonderzeichen)
$DB_CHARSET = "utf8mb4";

// DSN = Data Source Name (beschreibt, wie PDO sich verbindet)
$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";

// PDO-Optionen für sicheres und sauberes Arbeiten
$options = [
  // Wirft Exceptions bei Fehlern (wichtig für try/catch)
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,

  // fetch() liefert standardmäßig assoziative Arrays
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

  // Native Prepared Statements verwenden (Sicherheit)
  PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
  // Aufbau der Datenbankverbindung
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);

} catch (Throwable $e) {
  // Falls die DB-Verbindung fehlschlägt:

  // HTTP-Statuscode für Serverfehler
  http_response_code(500);

  // Antwort ist IMMER JSON (kein HTML!)
  header("Content-Type: application/json; charset=utf-8");

  // Fehlermeldung als JSON ausgeben
  echo json_encode([
    "ok" => false,
    "error" => "DB connection failed: " . $e->getMessage()
  ]);

  // Script sofort beenden
  exit;
}
