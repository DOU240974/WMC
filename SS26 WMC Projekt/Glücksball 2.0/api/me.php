<?php
// Erzwingt strikte Typisierung
declare(strict_types=1);

// Startet die Session, um auf Session-Daten zugreifen zu können
session_start();

// Setzt den Response-Header auf JSON mit UTF-8
header("Content-Type: application/json; charset=utf-8");

// Gibt den aktuellen Login-Status zurück
echo json_encode([
  // true, wenn eine user_id in der Session existiert → User ist eingeloggt
  "loggedIn" => isset($_SESSION["user_id"]),

  // Username aus der Session (oder null, falls nicht eingeloggt)
  "username" => $_SESSION["username"] ?? null
]);
