<?php
header('Content-Type: application/json; charset=utf-8');

const NEWSAPI_AI_KEY_B64 = 'Mjk3MDQ3XzE3Nzk3NDc3MDRfMmI0YmI1OTg5NzAxYjg2MDgwNTc0NmU3N2NmNzYzM2IzOTgxNjJmZQ==';
const SPORTMONKS_TOKEN_B64 = 'bWI4UDRqaFVaYTg1VTM4MlNXanE2YlNNdFBwOGJSdXNVWkZDaGMwN2V0M2FEazZNY2Y1WU5LYjlQSjMy';
const SPORTMONKS_FIXTURE_ID = 19568600;
const NEWS_CACHE_SECONDS = 21600;

function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function cache_file(): string {
  $dir = __DIR__ . '/cache';
  if (!is_dir($dir)) @mkdir($dir, 0775, true);
  return $dir . '/fussball_news.json';
}

function read_cache(bool $allowStale = false): ?array {
  $file = cache_file();
  if (!is_file($file)) return null;
  if (!$allowStale && (time() - filemtime($file)) > NEWS_CACHE_SECONDS) return null;
  $data = json_decode((string)@file_get_contents($file), true);
  return is_array($data) ? $data : null;
}

function write_cache(array $payload): void {
  @file_put_contents(cache_file(), json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}

function http_get_news(string $url) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT => 12,
      CURLOPT_CONNECTTIMEOUT => 5,
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

function sportmonks_token(): string {
  $env = getenv('SPORTMONKS_TOKEN');
  if ($env) return trim((string)$env);
  if (SPORTMONKS_TOKEN_B64 !== '') return (string)base64_decode(SPORTMONKS_TOKEN_B64, true);
  return '';
}

function normalize_news_title(string $title): string {
  $title = preg_replace('/\s+-\s+.+$/u', '', $title);
  return trim(mb_strtolower($title, 'UTF-8'));
}

function is_football_item(string $title): bool {
  $titleLower = mb_strtolower($title, 'UTF-8');
  $football = preg_match('/fussball|soccer|football|fifa|uefa|caf|afcon|afrika-cup|wm-qualifikation|europameisterschaft|nations league|copa america/i', $titleLower);
  $blocked = preg_match('/eishockey|hockey|handball|basketball|volleyball|tennis|ski|formel|motorsport/i', $titleLower);
  return (bool)$football && !$blocked;
}

function normalize_item(array $item, string $sourceName): array {
  $title = trim((string)($item['title'] ?? ''));
  $source = trim((string)($item['source'] ?? $sourceName));

  return [
    'title' => $title,
    'link' => trim((string)($item['link'] ?? $item['url'] ?? '')),
    'date' => trim((string)($item['date'] ?? $item['dateTime'] ?? $item['pubDate'] ?? '')),
    'source' => $source,
    'image' => '',
    'summary' => trim((string)($item['summary'] ?? ''))
  ];
}

function unique_news(array $items, int $limit): array {
  $seenLinks = [];
  $seenTitles = [];
  $unique = [];

  foreach ($items as $item) {
    $item = normalize_item($item, (string)($item['source'] ?? 'News'));
    if (!$item['title'] || !$item['link']) continue;
    if (!is_football_item($item['title'])) continue;

    $linkKey = $item['link'];
    $titleKey = normalize_news_title($item['title']);
    if ($linkKey && isset($seenLinks[$linkKey])) continue;
    if ($titleKey && isset($seenTitles[$titleKey])) continue;

    if ($linkKey) $seenLinks[$linkKey] = true;
    if ($titleKey) $seenTitles[$titleKey] = true;
    $unique[] = $item;

    if (count($unique) >= $limit) break;
  }

  return $unique;
}

function fetch_sportmonks_fixture_news(int $limit = 8): array {
  $token = sportmonks_token();
  if ($token === '') return [];

  $params = [
    'api_token' => $token,
    'include' => 'prematchNews.lines;postmatchNews.lines;participants;league;venue;state;scores;events.type'
  ];
  $url = 'https://api.sportmonks.com/v3/football/fixtures/' . SPORTMONKS_FIXTURE_ID . '?' . http_build_query($params);
  $json = http_get_news($url);
  if (!$json) return [];

  $payload = json_decode($json, true);
  $fixture = is_array($payload) ? ($payload['data'] ?? []) : [];
  if (!is_array($fixture)) return [];

  $teams = [];
  foreach (($fixture['participants'] ?? []) as $participant) {
    if (is_array($participant) && !empty($participant['name'])) $teams[] = (string)$participant['name'];
  }
  $matchName = count($teams) >= 2 ? $teams[0] . ' vs ' . $teams[1] : 'Sportmonks Match-News';

  $newsGroups = [
    'Sportmonks Pre-Match' => $fixture['prematchNews'] ?? $fixture['prematch_news'] ?? [],
    'Sportmonks Post-Match' => $fixture['postmatchNews'] ?? $fixture['postmatch_news'] ?? [],
  ];

  $items = [];
  foreach ($newsGroups as $source => $newsList) {
    if (!is_array($newsList)) continue;
    foreach ($newsList as $news) {
      if (!is_array($news)) continue;
      $lineTexts = [];
      foreach (($news['lines'] ?? []) as $line) {
        if (!is_array($line)) continue;
        $text = trim((string)($line['line'] ?? $line['text'] ?? $line['body'] ?? ''));
        if ($text !== '') $lineTexts[] = $text;
      }

      $summary = trim(implode(' ', array_slice($lineTexts, 0, 3)));
      $title = trim((string)($news['title'] ?? $news['headline'] ?? ''));
      if ($title === '') $title = $summary !== '' ? mb_substr($summary, 0, 90, 'UTF-8') : $matchName;
      if (!preg_match('/fussball|football|soccer/i', $title)) $title = 'Fussball: ' . $title;

      $items[] = normalize_item([
        'title' => $title,
        'link' => 'https://www.sportmonks.com/football-api/',
        'date' => trim((string)($news['published_at'] ?? $news['updated_at'] ?? $fixture['starting_at'] ?? '')),
        'source' => $source,
        'summary' => $summary
      ], $source);

      if (count($items) >= $limit) return $items;
    }
  }

  return $items;
}

function fetch_newsapi_ai(int $limit = 26): array {
  $apiKey = base64_decode(NEWSAPI_AI_KEY_B64, true);
  if (!$apiKey) return [];

  $params = [
    'resultType' => 'articles',
    'keyword' => 'Fussball OR FIFA OR UEFA OR AFCON OR WM-Qualifikation OR Nationalmannschaft',
    'keywordOper' => 'or',
    'lang' => 'deu',
    'articlesSortBy' => 'date',
    'articlesCount' => $limit,
    'includeArticleImage' => 'true',
    'apiKey' => $apiKey
  ];

  $url = 'https://eventregistry.org/api/v1/article/getArticles?' . http_build_query($params);
  $json = http_get_news($url);
  if (!$json) return [];

  $data = json_decode($json, true);
  $results = $data['articles']['results'] ?? [];
  if (!is_array($results)) return [];

  $items = [];
  foreach ($results as $article) {
    if (!is_array($article)) continue;
    $items[] = normalize_item([
      'title' => $article['title'] ?? '',
      'link' => $article['url'] ?? '',
      'date' => $article['dateTime'] ?? ($article['date'] ?? ''),
      'source' => $article['source']['title'] ?? 'NewsAPI.ai',
      'image' => $article['image'] ?? ''
    ], 'NewsAPI.ai');
  }

  return unique_news($items, $limit);
}

function fetch_google_news_section(string $query, string $sourceName, int $limit = 8): array {
  $hl = 'de';
  $gl = 'DE';
  $ceid = 'DE:de';
  $negative = '-Eishockey -Hockey -Handball -Basketball -Tennis -Motorsport';
  $url = 'https://news.google.com/rss/search?q=' . urlencode($query . ' ' . $negative) . "&hl={$hl}&gl={$gl}&ceid={$ceid}";
  $xmlStr = http_get_news($url);
  if (!$xmlStr) return [];

  $xml = @simplexml_load_string($xmlStr);
  if (!$xml || !isset($xml->channel->item)) return [];

  $items = [];
  foreach ($xml->channel->item as $item) {
    $items[] = normalize_item([
      'title' => trim(html_entity_decode((string)$item->title, ENT_QUOTES | ENT_XML1, 'UTF-8')),
      'link' => trim((string)$item->link),
      'date' => trim((string)$item->pubDate),
      'source' => $sourceName
    ], $sourceName);
  }

  return unique_news($items, $limit);
}

function official_links(): array {
  return [
    [
      'title' => 'FIFA - Offizielle Fussball-News',
      'link' => 'https://www.fifa.com/de/news',
      'date' => '',
      'source' => 'Offizieller Link',
      'image' => ''
    ],
    [
      'title' => 'UEFA - Nationalteam- und Turnier-News',
      'link' => 'https://de.uefa.com/news/',
      'date' => '',
      'source' => 'Offizieller Link',
      'image' => ''
    ],
    [
      'title' => 'CAF - Africa Cup of Nations',
      'link' => 'https://www.cafonline.com/',
      'date' => '',
      'source' => 'Offizieller Link',
      'image' => ''
    ]
  ];
}

try {
  $cached = read_cache(false);
  if ($cached) out($cached);

  $apiItems = fetch_newsapi_ai(30);
  $sportmonksNews = fetch_sportmonks_fixture_news(8);
  $news = array_slice(array_merge($sportmonksNews, $apiItems), 0, 14);
  if (count($news) === 0) {
    $news = fetch_google_news_section('Fussball Nationalmannschaft FIFA UEFA AFCON WM Qualifikation', 'Nachrichten', 12);
  }

  $sections = [
    'nachrichten' => $news,
    'videos' => fetch_google_news_section('Fussball Video Highlights Nationalmannschaft FIFA UEFA', 'Videos', 6),
    'bilder' => array_values(array_filter(array_slice($apiItems, 0, 18), fn($item) => !empty($item['image']))),
    'links' => official_links()
  ];

  $sections['bilder'] = [];

  $payload = [
    'ok' => true,
    'scope' => 'football-only',
    'source' => count($sportmonksNews) ? 'sportmonks-news-cache' : (count($apiItems) ? 'newsapi-ai-cache' : 'google-news-fallback'),
    'cached_until' => date(DATE_ATOM, time() + NEWS_CACHE_SECONDS),
    'sections' => $sections
  ];

  write_cache($payload);
  out($payload);
} catch (Throwable $e) {
  $stale = read_cache(true);
  if ($stale) out($stale);
  out(['ok' => false, 'error' => 'API error: ' . $e->getMessage()], 500);
}
