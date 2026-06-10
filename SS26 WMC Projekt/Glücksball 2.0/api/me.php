<?php
declare(strict_types=1);

session_start();
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/auth_guard.php";

$userId = isset($_SESSION["user_id"]) ? (int)$_SESSION["user_id"] : 0;
$loggedIn = $userId > 0 && is_user_approved($pdo, $userId);

if ($userId > 0 && !$loggedIn) {
  unset($_SESSION["user_id"], $_SESSION["username"]);
}

echo json_encode([
  "loggedIn" => $loggedIn,
  "username" => $loggedIn ? ($_SESSION["username"] ?? null) : null,
]);
