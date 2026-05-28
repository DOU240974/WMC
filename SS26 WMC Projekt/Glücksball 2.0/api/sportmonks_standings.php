<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const SPORTMONKS_STANDINGS_TOKEN_B64 = 'RXpsTk5QRzQ1QWx2bDZYbzdoM3lQMVZZTnoxNmZhNnZGSjlocnBxVEdINDRhdEp5UmpLbnpSU3YxbEp6';
const SPORTMONKS_STANDINGS_SEASON = 21887;
const SPORTMONKS_STANDINGS_CACHE_SECONDS = 21600;

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function cache_file(): string {
  $dir = __DIR__ . '/cache';
  if (!is_dir($dir)) @mkdir($dir, 0775, true);
  return $dir . '/sportmonks_standings_' . SPORTMONKS_STANDINGS_SEASON . '.json';
}

function read_cache(bool $allowStale = false): ?array {
  $file = cache_file();
  if (!is_file($file)) return null;
  if (!$allowStale && (time() - filemtime($file)) > SPORTMONKS_STANDINGS_CACHE_SECONDS) return null;
  $payload = json_decode((string)@file_get_contents($file), true);
  return is_array($payload) ? $payload : null;
}

function write_cache(array $payload): void {
  @file_put_contents(cache_file(), json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function token(): string {
  $env = getenv('SPORTMONKS_STANDINGS_TOKEN');
  if ($env) return trim((string)$env);
  return (string)base64_decode(SPORTMONKS_STANDINGS_TOKEN_B64, true);
}

function http_get(string $url) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 15,
      CURLOPT_CONNECTTIMEOUT => 6,
      CURLOPT_USERAGENT => 'GluecksBall/2.0',
      CURLOPT_SSL_VERIFYPEER => true
    ]);
    $out = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($out && $code >= 200 && $code < 300) return $out;
  }

  $ctx = stream_context_create([
    'http' => ['method' => 'GET', 'header' => "User-Agent: GluecksBall/2.0\r\n"],
    'ssl' => ['verify_peer' => true, 'verify_peer_name' => true]
  ]);
  return @file_get_contents($url, false, $ctx) ?: false;
}

function detail_value(array $row, array $needles): int {
  foreach (($row['details'] ?? []) as $detail) {
    if (!is_array($detail)) continue;
    $name = strtolower((string)($detail['type']['name'] ?? $detail['type']['code'] ?? $detail['type']['developer_name'] ?? ''));
    foreach ($needles as $needle) {
      if ($name !== '' && str_contains($name, $needle)) {
        return (int)($detail['value'] ?? 0);
      }
    }
  }
  return 0;
}

function row_from_standing(array $row): array {
  $participant = $row['participant'] ?? [];
  $played = detail_value($row, ['played', 'matches']);
  $wins = detail_value($row, ['won', 'win']);
  $draws = detail_value($row, ['draw']);
  $losses = detail_value($row, ['lost', 'loss']);
  $gf = detail_value($row, ['goals for', 'goal scored', 'scored']);
  $ga = detail_value($row, ['goals against', 'conceded']);
  $gd = detail_value($row, ['goal difference', 'difference']);

  return [
    'team' => (string)($participant['name'] ?? $row['participant_name'] ?? 'Team'),
    'iso2' => strtolower((string)($participant['country']['iso2'] ?? '')),
    'flag' => (string)($participant['image_path'] ?? ''),
    'p' => (int)($row['played'] ?? $played),
    'w' => (int)($row['won'] ?? $wins),
    'd' => (int)($row['draw'] ?? $draws),
    'l' => (int)($row['lost'] ?? $losses),
    'gf' => (int)($row['goals_for'] ?? $gf),
    'ga' => (int)($row['goals_against'] ?? $ga),
    'gd' => (int)($row['goal_difference'] ?? $gd),
    'pts' => (int)($row['points'] ?? detail_value($row, ['point'])),
  ];
}

function group_name(array $row): string {
  $group = $row['group'] ?? [];
  $stage = $row['stage'] ?? [];
  return (string)($group['name'] ?? $stage['name'] ?? 'Gruppe');
}

try {
  $cached = read_cache(false);
  if ($cached) out($cached);

  $params = [
    'api_token' => token(),
    'include' => 'participant;rule.type;details.type;form;stage;league;group'
  ];
  $url = 'https://api.sportmonks.com/v3/football/standings/seasons/' . SPORTMONKS_STANDINGS_SEASON . '?' . http_build_query($params);
  $json = http_get($url);
  if (!$json) {
    $stale = read_cache(true);
    if ($stale) out($stale);
    out(['ok' => false, 'groups' => [], 'error' => 'Sportmonks nicht erreichbar.'], 502);
  }

  $data = json_decode($json, true);
  $rows = $data['data'] ?? [];
  if (!is_array($rows) || count($rows) === 0) {
    out([
      'ok' => false,
      'groups' => [],
      'source' => 'sportmonks',
      'message' => (string)($data['message'] ?? 'Keine Standings gefunden oder kein Zugriff im aktuellen Plan.'),
      'raw_status' => 'empty'
    ]);
  }

  $groups = [];
  foreach ($rows as $row) {
    if (!is_array($row)) continue;
    $name = group_name($row);
    if (!isset($groups[$name])) {
      $groups[$name] = ['name' => $name, 'table' => []];
    }
    $groups[$name]['table'][] = row_from_standing($row);
  }

  $payload = [
    'ok' => true,
    'source' => 'sportmonks',
    'season' => SPORTMONKS_STANDINGS_SEASON,
    'groups' => array_values($groups),
    'cached_until' => date(DATE_ATOM, time() + SPORTMONKS_STANDINGS_CACHE_SECONDS)
  ];
  write_cache($payload);
  out($payload);
} catch (Throwable $e) {
  $stale = read_cache(true);
  if ($stale) out($stale);
  out(['ok' => false, 'groups' => [], 'error' => 'Sportmonks error: ' . $e->getMessage()], 500);
}
