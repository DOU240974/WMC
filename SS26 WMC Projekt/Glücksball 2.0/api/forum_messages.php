<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

function ensure_forum_table(PDO $pdo): void {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS forum_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_forum_created (created_at),
      INDEX idx_forum_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

try {
  ensure_forum_table($pdo);

  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("
      SELECT
        m.id,
        m.message,
        m.created_at,
        u.username
      FROM forum_messages m
      JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT 80
    ");
    $rows = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));

    out([
      'ok' => true,
      'loggedIn' => isset($_SESSION['user_id']),
      'username' => $_SESSION['username'] ?? null,
      'messages' => $rows,
    ]);
  }

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    out(['ok' => false, 'error' => 'Methode nicht erlaubt.'], 405);
  }

  if (!isset($_SESSION['user_id'])) {
    out(['ok' => false, 'error' => 'Bitte zuerst einloggen.'], 401);
  }

  $data = json_decode((string)file_get_contents('php://input'), true);
  if (!is_array($data)) {
    out(['ok' => false, 'error' => 'Ungültiges JSON.'], 400);
  }

  $message = trim((string)($data['message'] ?? ''));
  $message = preg_replace('/\s+/u', ' ', $message) ?? '';

  if ($message === '') {
    out(['ok' => false, 'error' => 'Bitte eine Nachricht schreiben.'], 400);
  }

  if (mb_strlen($message, 'UTF-8') > 500) {
    out(['ok' => false, 'error' => 'Nachrichten dürfen maximal 500 Zeichen haben.'], 400);
  }

  $stmt = $pdo->prepare("
    INSERT INTO forum_messages (user_id, message)
    VALUES (:uid, :message)
  ");
  $stmt->execute([
    ':uid' => (int)$_SESSION['user_id'],
    ':message' => $message,
  ]);

  out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
  out(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
