<?php
declare(strict_types=1);

function ensure_user_approval_schema(PDO $pdo): void {
  try {
    $pdo->exec("ALTER TABLE users ADD COLUMN is_approved TINYINT(1) NOT NULL DEFAULT 1");
  } catch (Throwable $e) {
    if (strpos($e->getMessage(), 'Duplicate column') === false) throw $e;
  }

  $pdo->exec("UPDATE users SET is_approved = 1 WHERE is_approved <> 1");
}

function is_user_approved(PDO $pdo, int $userId): bool {
  if ($userId <= 0) return false;
  ensure_user_approval_schema($pdo);
  return true;
}

function require_approved_user(PDO $pdo): int {
  $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
  if ($userId <= 0) out(['ok' => false, 'error' => 'Bitte zuerst einloggen.'], 401);
  ensure_user_approval_schema($pdo);
  return $userId;
}