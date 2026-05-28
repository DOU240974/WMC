<?php
// Erzwingt strikte Typisierung (verhindert ungewollte Typumwandlungen)
declare(strict_types=1);

// Startet eine Session (für Login-Zustand notwendig)
session_start();

// Setzt den Response-Header auf JSON mit UTF-8
header("Content-Type: application/json; charset=utf-8");

// Bindet die Datenbankverbindung ($pdo) ein
require_once __DIR__ . "/db.php";

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
$stmt = $pdo->prepare("
  SELECT id, username, password
  FROM users
  WHERE username = :u
  LIMIT 1
");
$stmt->execute([":u" => $username]);

// Benutzer-Datensatz holen
$user = $stmt->fetch();

// Falls kein User gefunden wurde
if (!$user) {
  out(["ok" => false, "error" => "User nicht gefunden"], 401);
}

// Passwort mit gespeichertem Hash vergleichen
if (!password_verify($password, (string)$user["password"]) && !hash_equals((string)$user["password"], $password)) {
  out(["ok" => false, "error" => "Passwort falsch"], 401);
}

// Login erfolgreich → Session-Variablen setzen
$_SESSION["user_id"]  = (int)$user["id"];
$_SESSION["username"] = (string)$user["username"];

// Erfolgreiche Antwort an das Frontend
out([
  "ok" => true,
  "username" => $_SESSION["username"]
]);
