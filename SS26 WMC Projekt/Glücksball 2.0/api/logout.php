<?php
// Erzwingt strikte Typisierung
declare(strict_types=1);

// Startet die aktuelle Session (muss aktiv sein, um sie zu beenden)
session_start();

// Setzt den Response-Header auf JSON mit UTF-8
header("Content-Type: application/json; charset=utf-8");

// Entfernt alle Session-Variablen
session_unset();

// Zerstört die komplette Session (Logout)
session_destroy();

// Sicherheitshalber nochmals JSON-Header setzen
header('Content-Type: application/json; charset=utf-8');

// Erfolgsantwort an das Frontend senden
echo json_encode([
  "ok" => true
]);
