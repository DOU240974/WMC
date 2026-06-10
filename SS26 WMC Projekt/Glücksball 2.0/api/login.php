<?php
// Erzwingt strikte Typisierung (verhindert ungewollte Typumwandlungen)
declare(strict_types=1);

// Startet eine Session (für Login-Zustand notwendig)
session_start();

// Setzt den Response-Header auf JSON mit UTF-8
header("Content-Type: application/json; charset=utf-8");

// Bindet die Datenbankverbindung ($pdo) ein
require_once __DIR__ . "/db.php";
require_once __DIR__ . "/auth_guard.php";

// Hilfsfunktion für einheitliche JSON-Antworten
function out(array $payload, int $code = 200): void {
  // HTTP-Statuscode setzen
  http_response_code($code);

  // Antwort als JSON ausgeben
  echo json_encode($payload);

  // Script sofort beenden
  exit;
}

// Rohdaten aus dem Request-Body lesen (JSON)
$raw = file_get_contents("php://input");

// JSON in ein PHP-Array umwandeln
$data = json_decode($raw, true);

// Falls kein gültiges JSON gesendet wurde → Fehler
if (!is_array($data)) {
  out(["ok" => false, "error" => "Invalid JSON"], 400);
}

// Username auslesen und trimmen (Leerzeichen entfernen)
$username = trim((string)($data["username"] ?? ""));

// Passwort auslesen
$password = (string)($data["password"] ?? "");

// Validierung: beide Felder müssen ausgefüllt sein
if ($username === "" || $password === "") {
  out(["ok" => false, "error" => "Bitte Username + Passwort eingeben"], 400);
}

// User anhand des Usernamens aus der DB laden
ensure_user_approval_schema($pdo);

$stmt = $pdo->prepare("
  SELECT id, username, password, is_approved
  FROM users
  WHERE username = :u
  LIMIT 1
");
$stmt->execute([":u" => $username]);

// Benutzer-Datensatz holen
$user = $stmt->fetch();

// Falls kein User gefunden wurde
if (!$user) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS pending_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  $pending = $pdo->prepare("SELECT id FROM pending_users WHERE username = :u LIMIT 1");
  $pending->execute([":u" => $username]);

  if ($pending->fetch()) {
    out(["ok" => false, "error" => "Dein Konto wartet noch auf Freigabe"], 403);
  }

  out(["ok" => false, "error" => "User nicht gefunden"], 401);
}

$storedPassword = (string)$user["password"];
$passwordOk = password_verify($password, $storedPassword);
$usedLegacyPlaintext = false;

// Alte Demo-User mit Klartext-Passwort werden beim Login automatisch migriert.
if (!$passwordOk && hash_equals($storedPassword, $password)) {
  $passwordOk = true;
  $usedLegacyPlaintext = true;
}

if (!$passwordOk) {
  out(["ok" => false, "error" => "Passwort falsch"], 401);
}

if ((int)$user["is_approved"] !== 1) {
  out(["ok" => false, "error" => "Dein Konto muss erst vom Admin freigegeben werden"], 403);
}

if ($usedLegacyPlaintext || password_needs_rehash($storedPassword, PASSWORD_DEFAULT)) {
  $newHash = password_hash($password, PASSWORD_DEFAULT);
  $updatePassword = $pdo->prepare("UPDATE users SET password = :p WHERE id = :id");
  $updatePassword->execute([
    ":p" => $newHash,
    ":id" => (int)$user["id"]
  ]);
}

// Login erfolgreich → Session-Variablen setzen
$_SESSION["user_id"]  = (int)$user["id"];
$_SESSION["username"] = (string)$user["username"];

// Erfolgreiche Antwort an das Frontend
out([
  "ok" => true,
  "username" => $_SESSION["username"]
]);
