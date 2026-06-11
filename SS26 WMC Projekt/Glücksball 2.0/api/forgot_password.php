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

function build_reset_link(string $token): string {
  $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
  $scheme = $https ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $basePath = rtrim(str_replace('/api', '', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/\\');
  $encodedBasePath = implode('/', array_map('rawurlencode', array_filter(explode('/', $basePath), 'strlen')));
  $encodedBasePath = $encodedBasePath !== '' ? '/' . $encodedBasePath : '';

  return $scheme . '://' . $host . $encodedBasePath . '/reset_password.html?token=' . urlencode($token);
}

function is_local_request(): bool {
  $host = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
  return str_starts_with($host, 'localhost')
    || str_starts_with($host, '127.0.0.1')
    || str_starts_with($host, '[::1]');
}

function log_reset_link(string $email, string $username, string $link): void {
  $logFile = dirname(__DIR__) . '/data/password_reset_links.txt';
  $line = '[' . date('Y-m-d H:i:s') . '] '
    . $username . ' <' . $email . '> '
    . $link . PHP_EOL;

  file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
}

// Auf XAMPP klappt PHP mail() meist nicht. Auf der Domain hängt es vom Mailserver des Hosters ab.
function send_reset_mail(string $to, string $username, string $link): bool {
  $subject = 'GlücksBall - Passwort zurücksetzen';
  $host = preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
  $fromDomain = $host !== '' ? $host : 'localhost';
  $message = "Hallo {$username},\n\n"
    . "du kannst dein Passwort über diesen Link neu setzen:\n"
    . $link . "\n\n"
    . "Der Link ist 60 Minuten gültig.\n\n"
    . "Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.\n\n"
    . "GlücksBall";

  $headers = [
    'From: GluecksBall <no-reply@' . $fromDomain . '>',
    'Reply-To: no-reply@' . $fromDomain,
    'Content-Type: text/plain; charset=UTF-8'
  ];

  return @mail($to, $subject, $message, implode("\r\n", $headers));
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  respond(['ok' => false, 'error' => 'Ungueltiges JSON'], 400);
}

$username = trim((string)($data['username'] ?? ''));
$email = trim((string)($data['email'] ?? ''));

if ($username === '' || $email === '') {
  respond(['ok' => false, 'error' => 'Bitte Username und E-Mail eingeben'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  respond(['ok' => false, 'error' => 'Bitte eine gueltige E-Mail eingeben'], 400);
}

try {
  ensure_user_approval_schema($pdo);
  ensure_password_reset_schema($pdo);

  $accountType = null;
  $account = null;

  $stmt = $pdo->prepare("
    SELECT id, username, email
    FROM users
    WHERE username = :u
      AND email = :e
    LIMIT 1
  ");
  $stmt->execute([':u' => $username, ':e' => $email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($user) {
    $accountType = 'user';
    $account = $user;
  } else {
    $pending = $pdo->prepare("
      SELECT id, username, email
      FROM pending_users
      WHERE username = :u
        AND email = :e
      LIMIT 1
    ");
    $pending->execute([':u' => $username, ':e' => $email]);
    $pendingUser = $pending->fetch(PDO::FETCH_ASSOC);

    if ($pendingUser) {
      $accountType = 'pending';
      $account = $pendingUser;
    }
  }

  if (!$accountType || !$account) {
    respond(['ok' => false, 'error' => 'Kein Konto mit diesem Username und dieser E-Mail gefunden'], 404);
  }

  $token = bin2hex(random_bytes(32));
  $tokenHash = hash('sha256', $token);

  $pdo->prepare("
    UPDATE password_resets
    SET used_at = NOW()
    WHERE account_type = :type
      AND account_id = :id
      AND used_at IS NULL
  ")->execute([
    ':type' => $accountType,
    ':id' => (int)$account['id']
  ]);

  $insert = $pdo->prepare("
    INSERT INTO password_resets (account_type, account_id, email, token_hash, expires_at)
    VALUES (:type, :id, :email, :token, DATE_ADD(NOW(), INTERVAL 60 MINUTE))
  ");
  $insert->execute([
    ':type' => $accountType,
    ':id' => (int)$account['id'],
    ':email' => (string)$account['email'],
    ':token' => $tokenHash
  ]);

  $link = build_reset_link($token);
  log_reset_link((string)$account['email'], (string)$account['username'], $link);

  $mailSent = send_reset_mail((string)$account['email'], (string)$account['username'], $link);
  $isLocal = is_local_request();

  $payload = [
    'ok' => true,
    'message' => $isLocal
      ? 'Lokaler XAMPP-Test: Der Reset-Link wurde erstellt. Da XAMPP ohne SMTP meist keine echten E-Mails sendet, wird der Link hier angezeigt und in data/password_reset_links.txt gespeichert.'
      : ($mailSent
        ? 'Wir haben dir einen Link zum Passwort-Zuruecksetzen per E-Mail geschickt.'
        : 'Der Reset-Link wurde erstellt, aber PHP mail() konnte keine E-Mail senden. Bitte Mail in XAMPP konfigurieren.')
  ];

  if ($isLocal || !$mailSent) {
    $payload['reset_link'] = $link;
  }

  respond($payload);
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()], 500);
}
