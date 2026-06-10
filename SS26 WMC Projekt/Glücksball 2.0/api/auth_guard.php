<?php
declare(strict_types=1);

function ensure_user_approval_schema(PDO $pdo): void {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS pending_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  try {
    $pdo->exec("ALTER TABLE users ADD COLUMN is_approved TINYINT(1) NOT NULL DEFAULT 0");
  } catch (Throwable $e) {
    if (strpos($e->getMessage(), 'Duplicate column') === false) {
      throw $e;
    }
  }
}

function is_user_approved(PDO $pdo, int $userId): bool {
  ensure_user_approval_schema($pdo);

  $stmt = $pdo->prepare("
    SELECT is_approved
    FROM users
    WHERE id = :id
    LIMIT 1
  ");
  $stmt->execute([':id' => $userId]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  return $user && (int)$user['is_approved'] === 1;
}

function require_approved_user(PDO $pdo): int {
  $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;

  if ($userId <= 0) {
    out(['ok' => false, 'error' => 'Bitte zuerst einloggen.'], 401);
  }

  if (!is_user_approved($pdo, $userId)) {
    unset($_SESSION['user_id'], $_SESSION['username']);
    out(['ok' => false, 'error' => 'Dein Konto muss erst vom Admin freigegeben werden.'], 403);
  }

  return $userId;
}
