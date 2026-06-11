<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_guard.php';

function respond(bool $ok, array $extra = [], int $code = 200): void {
  http_response_code($code);
  echo json_encode(array_merge(['ok' => $ok], $extra), JSON_UNESCAPED_UNICODE);
  exit;
}

$data = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($data)) respond(false, ['error' => 'Ungültiges JSON'], 400);

$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');
$email = trim((string)($data['email'] ?? ''));

if (strlen($username) < 3) respond(false, ['error' => 'Username zu kurz (min. 3 Zeichen)'], 400);
if (strlen($password) < 4) respond(false, ['error' => 'Passwort zu kurz (min. 4 Zeichen)'], 400);
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(false, ['error' => 'Bitte eine gültige E-Mail eingeben'], 400);

ensure_user_approval_schema($pdo);

$check = $pdo->prepare('SELECT id FROM users WHERE username = :u OR email = :e LIMIT 1');
$check->execute([':u' => $username, ':e' => $email]);
if ($check->fetch()) respond(false, ['error' => 'Username oder E-Mail bereits vergeben'], 409);

$insert = $pdo->prepare('
  INSERT INTO users (username, email, password, is_approved)
  VALUES (:u, :e, :p, 1)
');
$insert->execute([
  ':u' => $username,
  ':e' => $email,
  ':p' => password_hash($password, PASSWORD_DEFAULT),
]);

$_SESSION['user_id'] = (int)$pdo->lastInsertId();
$_SESSION['username'] = $username;

respond(true, [
  'username' => $username,
  'message' => 'Registrierung erfolgreich. Du bist jetzt eingeloggt.'
]);