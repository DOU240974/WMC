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
  // Forum-Nachrichten werden dauerhaft gespeichert, damit der Chat nicht nur im Browser existiert.
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

  // Pro User und Nachricht ist nur eine Reaktion erlaubt.
  // UNIQUE(message_id, user_id) sorgt dafür, dass Like/Dislike gewechselt statt doppelt gezählt wird.
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS forum_reactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message_id INT NOT NULL,
      user_id INT NOT NULL,
      reaction ENUM('like','dislike') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_forum_reaction (message_id, user_id),
      INDEX idx_forum_reaction_message (message_id),
      INDEX idx_forum_reaction_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");
}

try {
  ensure_forum_table($pdo);

  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : 0;
    // Liefert Nachrichten inklusive Zähler und eigener Reaktion des aktuell eingeloggten Users.
    $stmt = $pdo->prepare("
      SELECT
        m.id,
        m.message,
        m.created_at,
        u.username,
        COALESCE(SUM(CASE WHEN r.reaction = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN r.reaction = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes,
        MAX(CASE WHEN r.user_id = :uid THEN r.reaction ELSE NULL END) AS my_reaction
      FROM forum_messages m
      JOIN users u ON u.id = m.user_id
      LEFT JOIN forum_reactions r ON r.message_id = m.id
      GROUP BY m.id, m.message, m.created_at, u.username
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT 80
    ");
    $stmt->execute([':uid' => $userId]);
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

  if (isset($data['reaction'], $data['message_id'])) {
    // Like/Dislike: gleiche Reaktion erneut klicken entfernt die Stimme, andere Reaktion ersetzt sie.
    $messageId = (int)$data['message_id'];
    $reaction = (string)$data['reaction'];

    if ($messageId <= 0 || !in_array($reaction, ['like', 'dislike'], true)) {
      out(['ok' => false, 'error' => 'Ungültige Bewertung.'], 400);
    }

    $check = $pdo->prepare("SELECT id FROM forum_messages WHERE id = :id LIMIT 1");
    $check->execute([':id' => $messageId]);
    if (!$check->fetch()) {
      out(['ok' => false, 'error' => 'Nachricht nicht gefunden.'], 404);
    }

    $existing = $pdo->prepare("
      SELECT reaction
      FROM forum_reactions
      WHERE message_id = :mid AND user_id = :uid
      LIMIT 1
    ");
    $existing->execute([
      ':mid' => $messageId,
      ':uid' => (int)$_SESSION['user_id'],
    ]);
    $current = $existing->fetch(PDO::FETCH_ASSOC);

    if ($current && (string)$current['reaction'] === $reaction) {
      $delete = $pdo->prepare("
        DELETE FROM forum_reactions
        WHERE message_id = :mid AND user_id = :uid
      ");
      $delete->execute([
        ':mid' => $messageId,
        ':uid' => (int)$_SESSION['user_id'],
      ]);
      out(['ok' => true, 'reaction' => null]);
    }

    $upsert = $pdo->prepare("
      INSERT INTO forum_reactions (message_id, user_id, reaction)
      VALUES (:mid, :uid, :reaction)
      ON DUPLICATE KEY UPDATE reaction = VALUES(reaction), updated_at = CURRENT_TIMESTAMP
    ");
    $upsert->execute([
      ':mid' => $messageId,
      ':uid' => (int)$_SESSION['user_id'],
      ':reaction' => $reaction,
    ]);

    out(['ok' => true, 'reaction' => $reaction]);
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
