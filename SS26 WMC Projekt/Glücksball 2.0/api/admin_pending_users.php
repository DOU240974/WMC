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

$adminPassword = (string)($_GET['admin_password'] ?? '');
if (!hash_equals(ADMIN_PASSWORD, $adminPassword)) {
  out(['ok' => false, 'error' => 'Admin-Passwort falsch'], 403);
}

ensure_user_approval_schema($pdo);

$stmt = $pdo->query("
  SELECT id, 'pending' AS source, username, email, created_at
  FROM pending_users
  UNION ALL
  SELECT id, 'user' AS source, username, email, created_at
  FROM users
  WHERE is_approved = 0
  ORDER BY created_at ASC
");

out(['ok' => true, 'users' => $stmt->fetchAll()]);
