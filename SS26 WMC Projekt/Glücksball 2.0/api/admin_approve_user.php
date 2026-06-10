<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/admin_config.php';
require_once __DIR__ . '/auth_guard.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload);
  exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
  out(['ok' => false, 'error' => 'Ungueltiges JSON'], 400);
}

$adminPassword = (string)($data['admin_password'] ?? '');
$id = (int)($data['id'] ?? 0);
$action = (string)($data['action'] ?? '');
$source = (string)($data['source'] ?? 'pending');

if (!hash_equals(ADMIN_PASSWORD, $adminPassword)) {
  out(['ok' => false, 'error' => 'Admin-Passwort falsch'], 403);
}

if ($id <= 0 || !in_array($action, ['approve', 'reject'], true) || !in_array($source, ['pending', 'user'], true)) {
  out(['ok' => false, 'error' => 'Ungueltige Anfrage'], 400);
}

ensure_user_approval_schema($pdo);
$pdo->beginTransaction();

try {
  if ($source === 'user') {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = :id FOR UPDATE');
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch();

    if (!$user) {
      $pdo->rollBack();
      out(['ok' => false, 'error' => 'User nicht gefunden'], 404);
    }

    if ($action === 'approve') {
      $update = $pdo->prepare('UPDATE users SET is_approved = 1 WHERE id = :id');
      $update->execute([':id' => $id]);
    } else {
      $delete = $pdo->prepare('DELETE FROM users WHERE id = :id AND is_approved = 0');
      $delete->execute([':id' => $id]);
    }

    $pdo->commit();
    out(['ok' => true]);
  }

  $stmt = $pdo->prepare('SELECT * FROM pending_users WHERE id = :id FOR UPDATE');
  $stmt->execute([':id' => $id]);
  $pending = $stmt->fetch();

  if (!$pending) {
    $pdo->rollBack();
    out(['ok' => false, 'error' => 'Anfrage nicht gefunden'], 404);
  }

  if ($action === 'approve') {
    $check = $pdo->prepare('SELECT id FROM users WHERE username = :u LIMIT 1');
    $check->execute([':u' => $pending['username']]);

    if ($check->fetch()) {
      $pdo->rollBack();
      out(['ok' => false, 'error' => 'Username existiert bereits'], 409);
    }

    $insert = $pdo->prepare(
      'INSERT INTO users (username, email, password, is_approved, created_at)
       VALUES (:u, :e, :p, 1, NOW())'
    );
    $insert->execute([
      ':u' => $pending['username'],
      ':e' => $pending['email'],
      ':p' => $pending['password']
    ]);
  }

  $delete = $pdo->prepare('DELETE FROM pending_users WHERE id = :id');
  $delete->execute([':id' => $id]);

  $pdo->commit();
  out(['ok' => true]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) {
    $pdo->rollBack();
  }
  out(['ok' => false, 'error' => $e->getMessage()], 500);
}
