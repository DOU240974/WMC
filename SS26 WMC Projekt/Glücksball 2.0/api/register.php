<?php
// Strikte Typisierung aktivieren (hilft Typfehler früh zu erkennen)
declare(strict_types=1);

// Session starten (damit wir den User nach Registrierung direkt einloggen können)
session_start();

// Antwortformat: JSON (UTF-8)
header('Content-Type: application/json; charset=utf-8');

// DB-Verbindung laden ($pdo)
require_once __DIR__ . '/db.php';

// Hilfsfunktion: gibt eine standardisierte JSON-Antwort zurück und beendet das Script
function respond(bool $ok, array $extra = [], int $code = 200): void {
  // HTTP-Statuscode setzen
  http_response_code($code);

  // Basis-Feld "ok" + zusätzliche Daten zusammenführen und als JSON ausgeben
  echo json_encode(array_merge(['ok' => $ok], $extra));

  // Script beenden
  exit;
}

// Request-Body lesen (JSON kommt per POST)
$raw = file_get_contents('php://input');

// JSON in PHP-Array umwandeln
$data = json_decode($raw, true);

// Wenn kein gültiges JSON kommt → 400 Bad Request
if (!is_array($data)) {
  respond(false, ['error' => 'Ungültiges JSON'], 400);
}

// Eingaben aus dem JSON holen (mit Defaults)
$username = trim((string)($data['username'] ?? '')); // trim: entfernt Leerzeichen vorne/hinten
$password = (string)($data['password'] ?? '');      // Passwort als String
$email    = trim((string)($data['email'] ?? ''));   // Email optional

// Username-Länge prüfen
if (strlen($username) < 3) {
  respond(false, ['error' => 'Username zu kurz (min. 3 Zeichen)'], 400);
}

// Passwort-Länge prüfen
if (strlen($password) < 4) {
  respond(false, ['error' => 'Passwort zu kurz (min. 4 Zeichen)'], 400);
}

// Prüfen, ob der Username schon existiert
$check = $pdo->prepare(
  'SELECT id FROM users WHERE username = :u LIMIT 1'
);
$check->execute([':u' => $username]);

// Wenn ein Datensatz gefunden wurde → Username ist vergeben
if ($check->fetch()) {
  respond(false, ['error' => 'Username bereits vergeben'], 409);
}

// Passwort sicher hashen (nie Klartext speichern!)
$hash = password_hash($password, PASSWORD_DEFAULT);

// Neuen User einfügen (points startet bei 0)
$insert = $pdo->prepare(
  'INSERT INTO users (username, email, password, created_at)
   VALUES (:u, :e, :h, NOW())'
);

// Insert ausführen (email wird NULL, wenn leer)
$insert->execute([
  ':u' => $username,
  ':e' => ($email !== '' ? $email : null),
  ':h' => $hash
]);

// Nach erfolgreicher Registrierung: User direkt einloggen (Session setzen)
$_SESSION['user_id']  = (int)$pdo->lastInsertId(); // ID des neuen Users
$_SESSION['username'] = $username;                 // Username speichern

// Erfolgsantwort ans Frontend
respond(true, ['username' => $username]);
