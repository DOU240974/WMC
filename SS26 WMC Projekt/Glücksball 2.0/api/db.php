<?php
declare(strict_types=1);

function env_value(string $key, string $fallback): string {
  $value = getenv($key);
  return $value === false || $value === '' ? $fallback : $value;
}

// Lokal funktionieren diese Standardwerte mit XAMPP.
// Auf der Domain entweder hier anpassen oder Umgebungsvariablen setzen:
// GB_DB_HOST, GB_DB_NAME, GB_DB_USER, GB_DB_PASS, GB_DB_CHARSET
$DB_HOST = env_value('GB_DB_HOST', '127.0.0.1');
$DB_NAME = env_value('GB_DB_NAME', 'gbdatenbank');
$DB_USER = env_value('GB_DB_USER', 'root');
$DB_PASS = env_value('GB_DB_PASS', '');
$DB_CHARSET = env_value('GB_DB_CHARSET', 'utf8mb4');

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";

$options = [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES => false,
];

try {
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (Throwable $e) {
  http_response_code(500);
  header('Content-Type: application/json; charset=utf-8');

  echo json_encode([
    'ok' => false,
    'error' => 'DB connection failed'
  ]);

  exit;
}
