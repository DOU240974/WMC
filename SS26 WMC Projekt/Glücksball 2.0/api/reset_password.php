<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_guard.php';

function respond(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function ensure_password_reset_schema(PDO $pdo): void {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      account_type ENUM('user','pending') NOT NULL,
      account_id INT NOT NULL,
      email VARCHAR(255) NOT NULL,
      token_hash CHAR(64) NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      used_at DATETIME DEFAULT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_password_resets_token (token_hash),
      INDEX idx_password_resets_account (account_type, account_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  respond(['ok' => false, 'error' => 'Ungueltiges JSON'], 400);
}

$token = trim((string)($data['token'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($token === '' || $password === '') {
  respond(['ok' => false, 'error' => 'Bitte Link und neues Passwort angeben'], 400);
}

if (strlen($password) < 4) {
  respond(['ok' => false, 'error' => 'Passwort zu kurz (min. 4 Zeichen)'], 400);
}

try {
  ensure_user_approval_schema($pdo);
  ensure_password_reset_schema($pdo);

  $tokenHash = hash('sha256', $token);
  $stmt = $pdo->prepare("
    SELECT id, account_type, account_id
    FROM password_resets
    WHERE token_hash = :token
      AND used_at IS NULL
      AND expires_at >= NOW()
    LIMIT 1
  ");
  $stmt->execute([':token' => $tokenHash]);
  $reset = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$reset) {
    respond(['ok' => false, 'error' => 'Der Link ist ungueltig oder abgelaufen'], 400);
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);
  $pdo->beginTransaction();

  $userId = 0;
  $username = '';

  if ((string)$reset['account_type'] === 'user') {
    $update = $pdo->prepare("
      UPDATE users
      SET password = :password,
          is_approved = 1
      WHERE id = :id
    ");
    $update->execute([
      ':password' => $hash,
      ':id' => (int)$reset['account_id']
    ]);

    $userStmt = $pdo->prepare("SELECT id, username FROM users WHERE id = :id LIMIT 1");
    $userStmt->execute([':id' => (int)$reset['account_id']]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
      throw new RuntimeException('User nicht gefunden');
    }

    $userId = (int)$user['id'];
    $username = (string)$user['username'];
  } else {
    $pendingStmt = $pdo->prepare("SELECT username, email FROM pending_users WHERE id = :id LIMIT 1");
    $pendingStmt->execute([':id' => (int)$reset['account_id']]);
    $pending = $pendingStmt->fetch(PDO::FETCH_ASSOC);
    if (!$pending) {
      throw new RuntimeException('Pending User nicht gefunden');
    }

    $existing = $pdo->prepare("SELECT id FROM users WHERE username = :u LIMIT 1");
    $existing->execute([':u' => (string)$pending['username']]);
    if ($existing->fetch()) {
      throw new RuntimeException('Username existiert bereits');
    }

    $insert = $pdo->prepare("
      INSERT INTO users (username, email, password, created_at, is_approved)
      VALUES (:username, :email, :password, NOW(), 1)
    ");
    $insert->execute([
      ':username' => (string)$pending['username'],
      ':email' => (string)$pending['email'],
      ':password' => $hash
    ]);

    $userId = (int)$pdo->lastInsertId();
    $username = (string)$pending['username'];

    $deletePending = $pdo->prepare("DELETE FROM pending_users WHERE id = :id");
    $deletePending->execute([':id' => (int)$reset['account_id']]);
  }

  $markUsed = $pdo->prepare("UPDATE password_resets SET used_at = NOW() WHERE id = :id");
  $markUsed->execute([':id' => (int)$reset['id']]);

  $pdo->commit();

  $_SESSION['user_id'] = $userId;
  $_SESSION['username'] = $username;

  respond([
    'ok' => true,
    'username' => $username,
    'message' => 'Passwort wurde gesetzt. Du bist eingeloggt und kannst jetzt tippen.'
  ]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }

  respond(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
