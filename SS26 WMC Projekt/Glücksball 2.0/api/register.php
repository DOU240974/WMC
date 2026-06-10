<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_guard.php';

function respond(bool $ok, array $extra = [], int $code = 200): void {
  http_response_code($code);
  echo json_encode(array_merge(['ok' => $ok], $extra));
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  respond(false, ['error' => 'Ungueltiges JSON'], 400);
}

$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');
$email = trim((string)($data['email'] ?? ''));

if (strlen($username) < 3) {
  respond(false, ['error' => 'Username zu kurz (min. 3 Zeichen)'], 400);
}

if (strlen($password) < 4) {
  respond(false, ['error' => 'Passwort zu kurz (min. 4 Zeichen)'], 400);
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(false, ['error' => 'Bitte eine gueltige E-Mail eingeben'], 400);
}

ensure_user_approval_schema($pdo);

$check = $pdo->prepare('SELECT id FROM users WHERE username = :u LIMIT 1');
$check->execute([':u' => $username]);

if ($check->fetch()) {
  respond(false, ['error' => 'Username bereits vergeben'], 409);
}

$pendingCheck = $pdo->prepare('SELECT id FROM pending_users WHERE username = :u LIMIT 1');
$pendingCheck->execute([':u' => $username]);

if ($pendingCheck->fetch()) {
  respond(false, ['error' => 'Dieser Username wartet bereits auf Freigabe'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$insert = $pdo->prepare(
  'INSERT INTO pending_users (username, email, password, created_at)
   VALUES (:u, :e, :h, NOW())'
);

$insert->execute([
  ':u' => $username,
  ':e' => $email,
  ':h' => $hash
]);

respond(true, [
  'username' => $username,
  'message' => 'Registrierung gespeichert. Dein Konto muss noch freigegeben werden.'
]);
