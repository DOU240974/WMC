<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_guard.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

$data = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($data)) out(['ok' => false, 'error' => 'Ungültiges JSON'], 400);

$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') {
  out(['ok' => false, 'error' => 'Bitte Username + Passwort eingeben'], 400);
}

ensure_user_approval_schema($pdo);

$stmt = $pdo->prepare('
  SELECT id, username, password
  FROM users
  WHERE username = :username OR email = :email
  LIMIT 1
');
$stmt->execute([':username' => $username, ':email' => $username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) out(['ok' => false, 'error' => 'User nicht gefunden'], 401);

$storedPassword = (string)$user['password'];
$passwordOk = password_verify($password, $storedPassword);
$usedLegacyPlaintext = false;

if (!$passwordOk && hash_equals($storedPassword, $password)) {
  $passwordOk = true;
  $usedLegacyPlaintext = true;
}

if (!$passwordOk) out(['ok' => false, 'error' => 'Passwort falsch'], 401);

if ($usedLegacyPlaintext || password_needs_rehash($storedPassword, PASSWORD_DEFAULT)) {
  $newHash = password_hash($password, PASSWORD_DEFAULT);
  $updatePassword = $pdo->prepare('UPDATE users SET password = :p WHERE id = :id');
  $updatePassword->execute([':p' => $newHash, ':id' => (int)$user['id']]);
}

$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['username'] = (string)$user['username'];

out(['ok' => true, 'username' => $_SESSION['username']]);