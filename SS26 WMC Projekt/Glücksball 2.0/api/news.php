<?php
// Response wird als JSON ausgegeben (UTF-8)
header('Content-Type: application/json; charset=utf-8');

const SPORTMONKS_TOKEN_B64 = 'bWI4UDRqaFVaYTg1VTM4MlNXanE2YlNNdFBwOGJSdXNVWkZDaGMwN2V0M2FEazZNY2Y1WU5LYjlQSjMy';
const SPORTMONKS_FIXTURE_ID = 19568600;

/* =========================
   HTTP GET (cURL -> Fallback)
   - Holt eine URL (RSS Feed) per HTTP.
   - Bevorzugt cURL (robuster), sonst file_get_contents als Fallback.
   ========================= */
function http_get($url) {
  // Falls cURL verfügbar ist, verwenden
  if (function_exists('curl_init')) {
    // cURL-Handle initialisieren
    $ch = curl_init($url);

    // Wichtige Optionen setzen
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,  // Antwort als String zurückgeben (nicht direkt ausgeben)
      CURLOPT_FOLLOWLOCATION => true,  // Redirects folgen
      CURLOPT_TIMEOUT => 10,           // Max. Gesamtdauer
      CURLOPT_CONNECTTIMEOUT => 5,     // Max. Zeit für Verbindungsaufbau
      CURLOPT_USERAGENT => 'GluecksBall/2.0', // User-Agent (manche Dienste blocken sonst)
      CURLOPT_SSL_VERIFYPEER => true   // SSL-Zertifikat prüfen (sicherer)
    ]);

    // Request ausführen
    $out = curl_exec($ch);

    // HTTP Statuscode auslesen
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    // Handle schließen
    curl_close($ch);

    // Nur zurückgeben, wenn Antwort vorhanden UND Statuscode 2xx
    if ($out && $code >= 200 && $code < 300) return $out;
  }

  // Fallback: file_get_contents mit Stream-Context (inkl. User-Agent + SSL-Check)
  $ctx = stream_context_create([
    'http' => [
      'method' => 'GET',
      'header' => "User-Agent: GluecksBall/2.0\r\n"
    ],
    'ssl'  => [
      'verify_peer' => true,
      'verify_peer_name' => true
    ]
  ]);

  // @ unterdrückt Warnungen (z. B. wenn der Feed nicht erreichbar ist)
  $out = @file_get_contents($url, false, $ctx);

  // false, wenn kein Inhalt geladen wurde
  return $out ?: false;
}

function sportmonks_token() {
  $env = getenv('SPORTMONKS_TOKEN');
  if ($env) return trim((string)$env);
  if (SPORTMONKS_TOKEN_B64 !== '') return (string)base64_decode(SPORTMONKS_TOKEN_B64, true);
  return '';
}

function fetchSportmonksNews($limit = 3) {
  $token = sportmonks_token();
  if ($token === '') return [];

  $params = [
    'api_token' => $token,
    'include' => 'prematchNews.lines;postmatchNews.lines;participants;league;venue;state;scores;events.type'
  ];
  $url = 'https://api.sportmonks.com/v3/football/fixtures/' . SPORTMONKS_FIXTURE_ID . '?' . http_build_query($params);
  $json = http_get($url);
  if (!$json) return [];

  $payload = json_decode($json, true);
  if (!is_array($payload) || !isset($payload['data']) || !is_array($payload['data'])) return [];
  $fixture = $payload['data'];

  $teams = [];
  foreach (($fixture['participants'] ?? []) as $participant) {
    if (is_array($participant) && !empty($participant['name'])) $teams[] = (string)$participant['name'];
  }
  $matchName = count($teams) >= 2 ? $teams[0] . ' vs ' . $teams[1] : 'Sportmonks Match-News';

  $groups = [
    'Sportmonks Pre-Match' => $fixture['prematchNews'] ?? $fixture['prematch_news'] ?? [],
    'Sportmonks Post-Match' => $fixture['postmatchNews'] ?? $fixture['postmatch_news'] ?? [],
  ];

  $items = [];
  foreach ($groups as $source => $newsList) {
    if (!is_array($newsList)) continue;
    foreach ($newsList as $news) {
      if (!is_array($news)) continue;
      $lines = $news['lines'] ?? [];
      $lineTexts = [];
      if (is_array($lines)) {
        foreach ($lines as $line) {
          if (!is_array($line)) continue;
          $text = trim((string)($line['line'] ?? $line['text'] ?? $line['body'] ?? ''));
          if ($text !== '') $lineTexts[] = $text;
        }
      }

      $summary = trim(implode(' ', array_slice($lineTexts, 0, 2)));
      $title = trim((string)($news['title'] ?? $news['headline'] ?? ''));
      if ($title === '') $title = $summary ? mb_substr($summary, 0, 90, 'UTF-8') : $matchName;
      if (!preg_match('/fußball|fussball|football|soccer/i', $title)) $title = 'Fußball: ' . $title;

      $items[] = [
        'title' => $title,
        'link' => 'https://www.sportmonks.com/football-api/',
        'date' => trim((string)($news['published_at'] ?? $news['updated_at'] ?? $fixture['starting_at'] ?? '')),
        'source' => $source,
        'summary' => $summary,
        'image' => ''
      ];

      if (count($items) >= $limit) return $items;
    }
  }

  return $items;
}

/* =========================
   RSS PARSEN
   - Lädt RSS-XML, parst <item>-Einträge und gibt ein Array zurück.
   - limit begrenzt die Anzahl Einträge pro Feed.
   ========================= */
function fetchRssItems($url, $sourceName, $limit = 12) {
  // RSS-XML als String laden
  $xmlStr = http_get($url);
  if (!$xmlStr) return []; // Feed nicht erreichbar → leeres Array

  // XML parsen (SimpleXML)
  $xml = @simplexml_load_string($xmlStr);
  if (!$xml || !isset($xml->channel->item)) return []; // Ungültig/kein RSS → leeres Array

  $items = [];

  // Alle RSS-Items durchgehen
  foreach ($xml->channel->item as $item) {
    // Titel decode (HTML Entities) und trimmen
    $title = trim(html_entity_decode((string)$item->title, ENT_QUOTES | ENT_XML1, 'UTF-8'));

    // Link und Datum
    $link  = trim((string)$item->link);
    $date  = trim((string)$item->pubDate);

    // Item als Array speichern
    $items[] = [
      'title' => $title,
      'link' => $link,
      'date' => $date,
      'source' => $sourceName,
      'image' => ''
    ];

    // Abbrechen, wenn Limit erreicht
    if (count($items) >= $limit) break;
  }

  return $items;
}

/* =========================
   TITLE NORMALISIEREN (Duplikate)
   - Google News Titel sind oft "Headline - Quelle"
   - Damit du Duplikate leichter erkennst, wird:
     - Teil nach " - ..." entfernt
     - kleingeschrieben
     - getrimmt
   ========================= */
function normalize_title($t) {
  // Entfernt " - Irgendwas" am Ende
  $t = preg_replace('/\s+-\s+.+$/u', '', $t);

  // Trim + lowercase (UTF-8)
  $t = trim(mb_strtolower($t, 'UTF-8'));

  return $t;
}

/* =========================
   GOOGLE NEWS (DE)
   - Parameter für die RSS-Endpunkte
   ========================= */
$hl = "de";     // Sprache
$gl = "DE";     // Land
$ceid = "DE:de"; // Country/Edition ID

/* =========================
   FUSSBALL-QUERIES (NUR NATIONALTEAMS)
   - positive: Fußball + Turniere/Quali
   - context: muss nach Spielen/Ergebnissen klingen
   - negative: Vereinsfußball/Transfers/Ligen rausfiltern
   ========================= */

// Positive Begriffe (Fußball + Turniere)
$positive = '(' .
  'Fußball OR Fussball OR Soccer OR FIFA OR UEFA OR CAF OR CONMEBOL OR ' .
  '"Fußball-WM" OR "Fussball-WM" OR "Weltmeisterschaft Fußball" OR "WM-Qualifikation" OR "WM Qualifikation" OR ' .
  'EURO OR "Europameisterschaft" OR "Nations League" OR ' .
  'AFCON OR "Afrika-Cup" OR "Africa Cup of Nations" OR ' .
  '"Copa América" OR "Copa America" OR ' .
  '"Gold Cup" OR "CONCACAF Gold Cup" OR ' .
  '"Asian Cup" OR "Asien-Cup" OR ' .
  '"OFC Nations Cup" OR ' .
  '"Arab Cup" OR "Arabischer Cup" OR ' .
  '"Continental Championship" OR "Kontinentalmeisterschaft"' .
')';

// Kontext-Begriffe (damit es wirklich um Spiele/Turnier geht)
$context = '(' .
  'Nationalmannschaft OR Nationalteam OR Qualifikation OR Gruppe OR Gruppenphase OR ' .
  'Viertelfinale OR Halbfinale OR Finale OR Spielplan OR Ergebnis OR Tor OR Tore OR "gegen" OR "vs"' .
')';

// Negative Begriffe (Verein/Club/Transfers/Ligen)
$negative = '(' .
  'Eishockey OR Hockey OR Handball OR Basketball OR Volleyball OR Tennis OR Ski OR Formel OR Motorsport OR ' .
  'Bundesliga OR "Champions League" OR "Europa League" OR "Conference League" OR ' .
  '"Premier League" OR LaLiga OR "Ligue 1" OR Serie A OR MLS OR ' .
  'Verein OR Club OR Transfer OR Transfers OR "Transfermarkt" OR "Vertrag" OR ' .
  '"Trainer von" OR "FC" OR "SV" OR "Borussia" OR "Bayern" OR "Dortmund"' .
')';

/* =========================
   Query 1: (positive AND context) minus negative
   - Google News RSS unterstützt "-" Ausschlüsse.
   - Hier werden die OR-Begriffe aus $negative in einzelne "-Wörter" umgebaut.
   ========================= */
$q1 = $positive . " " . $context .
      " -" . str_replace(" OR ", " -", str_replace(['(', ')', '"'], '', $negative));

/* =========================
   Query 2: enger Fokus auf Ergebnisse/Spielberichte
   - ebenfalls Ausschlüsse gegen Vereinscontent
   ========================= */
$q2 = '(' .
  '"Fußball AFCON Ergebnis" OR "Fußball Afrika-Cup Ergebnis" OR "Fußball EURO Ergebnis" OR ' .
  '"Fußball Nations League Ergebnis" OR "Fußball WM-Qualifikation Ergebnis" OR ' .
  '"Fußball Copa América Ergebnis" OR "Fußball Gold Cup Ergebnis" OR "Fußball Asian Cup Ergebnis"' .
') -Eishockey -Hockey -Handball -Basketball -Bundesliga -Verein -Transfer -Champions -Europa -League -Premier -LaLiga -Ligue -Serie';

/* =========================
   FEEDS (2 Queries)
   - Beide Google-News-RSS-Search-Feeds werden geladen.
   ========================= */
$feeds = [
  [
    'url' => "https://news.google.com/rss/search?q=" . urlencode($q1) . "&hl={$hl}&gl={$gl}&ceid={$ceid}",
    'name' => 'Turnier-News'
  ],
  [
    'url' => "https://news.google.com/rss/search?q=" . urlencode($q2) . "&hl={$hl}&gl={$gl}&ceid={$ceid}",
    'name' => 'Ergebnisse'
  ],
];

/* =========================
   Sammeln
   - Items aus beiden Feeds holen und zusammenführen
   ========================= */
$all = [];
$all = array_merge($all, fetchSportmonksNews(4));
foreach ($feeds as $f) {
  $all = array_merge($all, fetchRssItems($f['url'], $f['name'], 12));
}

/* =========================
   Duplikate entfernen (Link + Titel)
   - gleiche Links oder (normalisierte) Titel werden gefiltert
   ========================= */
$seenLinks = [];
$seenTitles = [];
$unique = [];

foreach ($all as $it) {
  $linkKey = $it['link'];
  $titleKey = normalize_title($it['title']);
  $titleLower = mb_strtolower($it['title'], 'UTF-8');

  $hasFootball =
    preg_match('/fußball|fussball|soccer|fifa|uefa|caf|afcon|afrika-cup|africa cup|copa am[eé]rica|nations league|wm-qualifikation|weltmeisterschaft fußball|football/i', $titleLower);

  $hasOtherSport =
    preg_match('/eishockey|hockey|handball|basketball|volleyball|tennis|ski|formel|motorsport/i', $titleLower);

  if (!$hasFootball || $hasOtherSport) continue;

  // Duplikat per Link
  if ($linkKey && isset($seenLinks[$linkKey])) continue;

  // Duplikat per normalisiertem Titel
  if ($titleKey && isset($seenTitles[$titleKey])) continue;

  // Als gesehen markieren
  if ($linkKey) $seenLinks[$linkKey] = true;
  if ($titleKey) $seenTitles[$titleKey] = true;

  // Item übernehmen
  $unique[] = $it;
}

/* =========================
   Nach Datum sortieren (neueste zuerst)
   - pubDate wird via strtotime in Timestamp umgewandelt
   ========================= */
usort($unique, function($a, $b) {
  $ta = strtotime($a['date']) ?: 0;
  $tb = strtotime($b['date']) ?: 0;
  return $tb <=> $ta; // absteigend
});

/* =========================
   LIMIT: genau 4 News
   ========================= */
$unique = array_slice($unique, 0, 4);

// Finale JSON-Antwort
echo json_encode([
  'ok' => true,
  'items' => $unique
], JSON_UNESCAPED_UNICODE);
