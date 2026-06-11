# GlücksBall Code-Erklärung

Diese Datei erklärt den Aufbau des Codes und wofür die wichtigsten Dateien zuständig sind.

## 1. Grundidee

Das Projekt besteht aus drei Teilen:

- HTML-Dateien für die Seiten
- JavaScript-Dateien für Bedienung im Browser
- PHP-APIs für Datenbank, Login, Tipps, Ranking und Forum

Der Browser lädt eine HTML-Seite. Die Seite lädt CSS und JavaScript. Das JavaScript ruft PHP-Dateien im Ordner `api/` auf. Die PHP-Dateien lesen oder schreiben Daten in MySQL.

Kurz:

`HTML -> JavaScript -> PHP API -> MySQL`

## 2. Ordnerstruktur

`api/`

Backend. Hier liegen PHP-Dateien, die JSON zurückgeben oder Daten speichern.

`js/`

Frontend-Logik. Hier wird mit `fetch()` auf die API zugegriffen und HTML dynamisch gefüllt.

`css/`

Design der gesamten Seite. Die wichtigste Datei ist `css/style.css`.

`image/`

Bilder und Logo.

`data/`

Lokale Daten und Hilfsdateien, zum Beispiel Reset-Link-Log für XAMPP.

`datenbank_backup/`

SQL-Backups der Datenbank.

## 3. HTML-Dateien

### `index.html`

Startseite.

Enthält:

- Header und Navigation
- Login
- Passwort vergessen
- Registrierung
- Fußball-News
- kommende Spiele

Wichtige IDs:

- `loginForm`: Login-Formular
- `forgotForm`: Passwort-vergessen-Formular
- `registerForm`: Registrierung
- `nationalNews`: News-Liste
- `upcomingMatches`: kommende Spiele

Logik:

- kommt aus `js/app.js`

### `tipps.html`

Ehrentipps.

Enthält:

- WM-Favorit
- Gruppenfilter
- WM-Gruppenspiele
- Finalrunde

Wichtige IDs:

- `wmFavoriteCard`: WM-Favorit-Box
- `wmChampionTeam`: Weltmeister-Auswahl
- `wmTopScorer`: Top-Torjäger
- `wmTotalGoals`: gesamte Tore
- `wmMatches`: Gruppenspiele
- `wmKnockoutSection`: Finalrunde
- `wmKnockoutMatches`: KO-Spiele

Logik:

- kommt aus `js/wm-tipps.js`

### `spasstipp.html`

Spaßtipps.

Spaßtipps sind getrennt vom Ehren-Ranking.

Logik:

- kommt aus `js/spasstipp.js`

### `ranking.html`

Ranking-Seite.

Enthält:

- Ehren-Ranking
- WM-Favoriten
- Hall of Fame

Wichtige IDs:

- `rankingBody`: Tabelleninhalt des Rankings
- `favoriteRankingBody`: WM-Favoriten-Tabelle
- `hallOfFameSection`: Hall of Fame, standardmäßig unsichtbar
- `hallOfFame`: Inhalt der Hall of Fame

Logik:

- kommt aus `js/ranking.js`

### `statistik.html`

Persönliche Statistik.

Zeigt:

- Userdaten
- Anzahl Tipps
- Punkte
- exakte Tipps
- richtige Tendenzen
- falsche Tipps
- Ehrentipps
- Spaßtipps

Logik:

- kommt aus `js/statistik.js`

### `forum.html`

Forum.

Enthält:

- Nachrichtenliste
- Eingabefeld
- Aktualisieren-Button
- Likes und Dislikes

Logik:

- kommt aus `js/forum.js`

### `admin_freigabe.html`

Admin-Bereich.

Enthält:

- Admin-Passwort-Feld
- offene Registrierungen
- aktive User
- Freigeben
- Ablehnen
- Sperren

Logik:

- kommt aus `js/admin_freigabe.js`

### `regeln.html`

Regelseite.

Reine Inhaltsseite mit Regelboxen und Bild.

## 4. CSS

### `css/style.css`

Zentrale Design-Datei für alle Seiten.

Enthält:

- Farben
- Darkmode/Lightmode
- Header
- Navigation
- Karten
- Tabellen
- Forum
- Ranking
- Hall of Fame
- Regeln
- responsive Layouts

Wichtig:

Wenn CSS im Browser nicht aktualisiert wird, wird in HTML-Dateien die Version erhöht:

`css/style.css?v=12`

Dadurch lädt der Browser die neue Datei statt einer alten Cache-Version.

## 5. JavaScript-Dateien

### `js/app.js`

Zentrale Logik, die auf vielen Seiten gebraucht wird.

Aufgaben:

- Login
- Logout
- Navigation-Status
- Theme umschalten
- Registrierung
- Passwort vergessen
- News laden
- kommende Spiele laden

Wichtige API-Aufrufe:

- `api/login.php`
- `api/logout.php`
- `api/me.php`
- `api/register.php`
- `api/forgot_password.php`
- `api/news.php`
- `api/upcoming_matches.php`

### `js/wm-tipps.js`

Logik für Ehrentipps.

Aufgaben:

- WM-Gruppenspiele laden
- Gruppenfilter anzeigen
- Tipps speichern
- WM-Favorit laden und speichern
- Finalrunde verstecken, solange nur Platzhalter vorhanden sind

Wichtige Funktionen:

- `isPlaceholderTeam(teamName)`: erkennt Platzhalter wie `1. Gruppe A`
- `renderKnockoutMatches(matches)`: rendert KO-Spiele nur mit echten Teams
- `loadWmFavorite()`: lädt WM-Favorit
- `saveWmFavorite()`: speichert WM-Favorit

Wichtige API-Aufrufe:

- `api/wm_matches_v2.php`
- `api/wm_place_tip.php`
- `api/wm_favorite.php`

### `js/ranking.js`

Logik für Ranking.

Aufgaben:

- Ranking laden
- Ranking-Tabelle anzeigen
- WM-Favoriten anzeigen
- Hall of Fame erst nach WM-Ende anzeigen

Wichtige Funktionen:

- `sortRankingRows(rows)`: sortiert User nach Punkten, exakten Tipps und Tippanzahl
- `renderRanking(rows)`: baut Ranking-Tabelle
- `renderFavorites(rows)`: baut WM-Favoriten-Tabelle
- `renderHallOfFame(rows, isComplete)`: zeigt Top 3 erst nach WM-Ende

Wichtiger API-Aufruf:

- `api/ranking.php`

### `js/statistik.js`

Logik für persönliche Statistik.

Aufgaben:

- prüfen, ob User eingeloggt ist
- Statistik laden
- Ehrentipps anzeigen
- Spaßtipps anzeigen
- Flaggen anzeigen

Wichtige API-Aufrufe:

- `api/me.php`
- `api/my_stats.php`

### `js/forum.js`

Logik für Forum.

Aufgaben:

- Nachrichten laden
- Nachricht senden
- Like/Dislike senden
- Forum alle 15 Sekunden aktualisieren

Wichtige Funktionen:

- `renderForumMessages(messages)`: zeigt Nachrichten mit Likes/Dislikes
- `sendForumMessage(event)`: sendet neue Nachricht
- `voteForumMessage(event)`: sendet Like oder Dislike

Wichtiger API-Aufruf:

- `api/forum_messages.php`

### `js/admin_freigabe.js`

Logik für Admin-Seite.

Aufgaben:

- Admin-Passwort speichern
- offene Registrierungen laden
- aktive User laden
- User freigeben
- User ablehnen
- User sperren

Wichtige API-Aufrufe:

- `api/admin_pending_users.php`
- `api/admin_approve_user.php`

## 6. PHP-APIs

Alle PHP-Dateien im Ordner `api/` geben meistens JSON zurück.

JSON bedeutet:

```json
{ "ok": true }
```

oder bei Fehlern:

```json
{ "ok": false, "error": "Fehlermeldung" }
```

### `api/db.php`

Stellt die Datenbankverbindung her.

Nutzt lokal Standardwerte und kann auf der Domain Umgebungsvariablen lesen:

- `GB_DB_HOST`
- `GB_DB_NAME`
- `GB_DB_USER`
- `GB_DB_PASS`
- `GB_DB_CHARSET`

Alle anderen PHP-Dateien nutzen diese Verbindung über:

```php
require_once __DIR__ . '/db.php';
```

### `api/auth_guard.php`

Hilfsdatei für Login-Schutz.

Wichtig:

- erstellt fehlende Freigabe-Tabellen/Spalten
- prüft, ob ein User freigegeben ist
- blockiert gesperrte User

Wichtige Funktion:

`require_approved_user($pdo)`

Diese Funktion wird von APIs genutzt, bei denen ein User wirklich eingeloggt und freigegeben sein muss.

### `api/register.php`

Registrierung.

Ablauf:

1. JSON lesen
2. Benutzername prüfen
3. E-Mail prüfen
4. Passwort hashen
5. User in `pending_users` speichern

Der User ist danach noch nicht aktiv.

### `api/login.php`

Login.

Ablauf:

1. User über Username suchen
2. Passwort prüfen
3. `is_approved` prüfen
4. Session setzen

Unterstützt auch alte Klartext-Passwörter und wandelt sie beim Login in Hashes um.

### `api/logout.php`

Beendet die Session.

### `api/me.php`

Gibt zurück, ob ein User eingeloggt ist.

Wird im Frontend genutzt, um Navigation und Statusanzeige zu aktualisieren.

### `api/admin_pending_users.php`

Admin-API zum Laden von Usern.

Liefert:

- offene Registrierungen
- alte nicht freigegebene User
- aktive User

Nur mit richtigem Admin-Passwort.

### `api/admin_approve_user.php`

Admin-API für Entscheidungen.

Mögliche Aktionen:

- `approve`: freigeben
- `reject`: ablehnen
- `suspend`: aktiven User sperren

### `api/forgot_password.php`

Erstellt Passwort-Reset-Link.

Ablauf:

1. Benutzername und E-Mail prüfen
2. Token erstellen
3. Token gehasht in `password_resets` speichern
4. Reset-Link erzeugen
5. E-Mail senden

Lokal:

Der Link wird zusätzlich angezeigt und in `data/password_reset_links.txt` gespeichert.

### `api/reset_password.php`

Setzt neues Passwort.

Ablauf:

1. Token prüfen
2. Ablaufzeit prüfen
3. neues Passwort hashen
4. Passwort speichern
5. Token als benutzt markieren
6. User direkt einloggen

Wenn der Reset für einen noch offenen Pending-User genutzt wird, wird dieser User direkt in `users` übernommen und freigegeben.

### `api/wm_matches_v2.php`

Lädt WM-Spiele.

Gibt Spiele inklusive gespeicherter Tipps des aktuellen Users zurück.

### `api/wm_place_tip.php`

Speichert Ehrentipp.

Prüft:

- User eingeloggt und freigegeben
- Spiel existiert
- Spiel gehört zur WM
- Tipp ist vor Spielbeginn
- Tore sind gültige Zahlen

### `api/fun_matches_v2.php`

Lädt Spaßtipps-Spiele.

### `api/fun_place_tip.php`

Speichert Spaßtipp.

Spaßtipps zählen nicht ins Ehren-Ranking.

### `api/wm_favorite.php`

Lädt und speichert WM-Favorit.

Speichert:

- Weltmeister-Tipp
- Top-Torjäger-Tipp
- Gesamt-Tore-Tipp

Nach Beginn des ersten WM-Spiels ist die Eingabe gesperrt.

### `api/ranking.php`

Berechnet Ranking.

Wichtige Aufgaben:

- WM-Favorit-Tabellen anlegen
- WM-Ende prüfen
- WM-Favorit-Bonus berechnen
- Ehren-Ranking berechnen
- Hall of Fame liefern
- Admin ausblenden

Punkte:

- exakt: 3
- Tendenz: 1
- falsch: 0
- WM-Favorit-Bonus nach WM-Ende: je Kategorie 25

Sortierung:

1. Punkte absteigend
2. exakte Tipps absteigend
3. Tipps aufsteigend
4. Username alphabetisch

### `api/my_stats.php`

Berechnet persönliche Statistik.

Trennt:

- Ehrentipps
- Spaßtipps

Berechnet:

- alle Tipps
- fertige Spiele
- exakte Tipps
- Tendenzen
- falsche Tipps
- Punkte

### `api/forum_messages.php`

Forum-API.

GET:

- lädt Nachrichten
- lädt Likes
- lädt Dislikes
- lädt eigene Reaktion

POST mit `message`:

- speichert neue Nachricht

POST mit `message_id` und `reaction`:

- speichert Like/Dislike
- entfernt gleiche Reaktion bei erneutem Klick
- ersetzt Like durch Dislike oder umgekehrt

### `api/news.php`

Lädt Fußball-News.

Die Startseite zeigt davon nur eine begrenzte Anzahl.

### `api/upcoming_matches.php`

Lädt kommende Spiele für die Startseite.

## 7. Datenbanktabellen

### `users`

Normale User.

Wichtige Felder:

- `id`
- `username`
- `email`
- `password`
- `is_approved`
- `created_at`

### `pending_users`

Registrierungen, die noch nicht freigegeben wurden.

### `spiele`

Alle Spiele.

Wichtige Felder:

- `id`
- `match_id`
- `competition`
- `group_name`
- `team_home`
- `team_away`
- `date`
- `score_home`
- `score_away`
- `status`
- `aktiv`

### `tipps`

Gespeicherte Tipps.

Wichtige Felder:

- `user_id`
- `spiel_id`
- `tipp_home`
- `tipp_away`

### `wm_favorites`

WM-Favoriten der User.

Wichtige Felder:

- `user_id`
- `champion_team`
- `top_scorer`
- `total_goals`
- `points_champion`
- `points_top_scorer`
- `points_total_goals`

### `wm_results`

Nach WM-Ende für Zusatzdaten.

Aktuell wichtig:

- `top_scorer`

### `password_resets`

Reset-Tokens für Passwort vergessen.

### `forum_messages`

Forum-Nachrichten.

### `forum_reactions`

Likes und Dislikes.

Wichtig:

`UNIQUE(message_id, user_id)` verhindert mehrere Stimmen desselben Users auf dieselbe Nachricht.

## 8. Wichtige Sicherheitsideen

Passwörter:

- werden mit `password_hash()` gespeichert
- werden mit `password_verify()` geprüft

SQL:

- Benutzerwerte werden mit Prepared Statements verarbeitet

Sessions:

- Loginstatus liegt in PHP-Session

Freigabe:

- viele APIs nutzen `require_approved_user()`

Admin:

- Admin-APIs prüfen `ADMIN_PASSWORD`

HTML-Ausgabe:

- JavaScript nutzt `escapeHtml()`, damit Nachrichten und Usernamen nicht direkt HTML einschleusen.

## 9. Cache-Versionen

Viele HTML-Dateien laden JS/CSS mit Version:

```html
<script src="js/ranking.js?v=105"></script>
```

oder:

```html
<link rel="stylesheet" href="css/style.css?v=12">
```

Wenn der Browser alte Dateien cached, wird die Zahl erhöht.

## 10. Typische Änderungsstellen

Admin-Passwort ändern:

`api/admin_config.php`

Datenbankdaten ändern:

`api/db.php`

Startseiten-News-Anzahl ändern:

`js/app.js`

Ranking-Punkte ändern:

`api/ranking.php`

Persönliche Statistik ändern:

`api/my_stats.php`

Forum-Verhalten ändern:

`api/forum_messages.php` und `js/forum.js`

Finalrunde-Sichtbarkeit ändern:

`js/wm-tipps.js`

Design ändern:

`css/style.css`

## 11. Technischer Ablauf Einer Seite

Fast jede Seite folgt demselben Muster:

1. Browser lädt eine `.html`-Datei.
2. Die HTML-Datei lädt `css/style.css`.
3. Die HTML-Datei lädt ein oder mehrere JavaScript-Dateien.
4. JavaScript wartet auf `DOMContentLoaded`.
5. JavaScript ruft eine PHP-API mit `fetch()` auf.
6. PHP liest Daten aus MySQL oder schreibt Daten hinein.
7. PHP antwortet mit JSON.
8. JavaScript baut daraus sichtbares HTML.

Beispiel Ranking:

```text
ranking.html
-> js/ranking.js
-> api/ranking.php
-> MySQL: users, tipps, spiele, wm_favorites
-> JSON zurück
-> Tabelle wird gerendert
```

Beispiel Forum:

```text
forum.html
-> js/forum.js
-> api/forum_messages.php
-> MySQL: forum_messages, forum_reactions
-> JSON zurück
-> Nachrichten + Like/Dislike Buttons werden gerendert
```

## 12. Gemeinsame API-Struktur

Viele PHP-Dateien benutzen dieselbe Struktur:

```php
declare(strict_types=1);
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/db.php';
```

Bedeutung:

- `strict_types=1`: PHP soll Typen strenger prüfen.
- `session_start()`: Zugriff auf Login-Session.
- `Content-Type: application/json`: API antwortet mit JSON.
- `db.php`: Datenbankverbindung.

Fast jede API hat außerdem eine `out()`-Funktion:

```php
function out(array $payload, int $code = 200): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}
```

Warum:

- einheitliche JSON-Antwort
- HTTP-Status kann gesetzt werden
- `exit` verhindert, dass danach noch etwas ausgegeben wird

Erfolgreiche Antwort:

```json
{
  "ok": true,
  "data": []
}
```

Fehlerantwort:

```json
{
  "ok": false,
  "error": "Bitte zuerst einloggen."
}
```

## 13. Frontend-API-Aufrufe Mit `fetch`

Im JavaScript wird fast überall `fetch()` verwendet.

GET-Beispiel:

```js
const res = await fetch("api/ranking.php", {
  credentials: "include",
  cache: "no-store"
});
```

POST-Beispiel:

```js
await fetch("api/wm_place_tip.php", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    spiel_id: 123,
    tipp_home: 2,
    tipp_away: 1
  })
});
```

Wichtig:

- `credentials: "include"` sorgt dafür, dass die PHP-Session-Cookies mitgeschickt werden.
- Ohne Cookies wüsste PHP nicht, welcher User eingeloggt ist.
- `cache: "no-store"` verhindert alte API-Daten aus dem Browser-Cache.

## 14. Session Und Loginstatus

Nach erfolgreichem Login setzt `api/login.php`:

```php
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['username'] = (string)$user['username'];
```

Danach können andere APIs prüfen:

```php
isset($_SESSION['user_id'])
```

Noch strenger ist:

```php
require_approved_user($pdo)
```

Diese Funktion prüft:

1. Gibt es eine Session?
2. Ist `user_id` gültig?
3. Ist `users.is_approved = 1`?
4. Wenn nein, wird der User ausgeloggt/blockiert.

Das ist wichtig für:

- Tipps speichern
- Spaßtipps speichern
- Forum schreiben
- Forum bewerten
- WM-Favorit speichern
- Statistik anzeigen

## 15. Admin-Freigabe Im Detail

### Registrierung

`api/register.php` schreibt neue User nicht direkt in `users`, sondern in:

```text
pending_users
```

Dadurch kann sich nicht jeder sofort beteiligen.

### Freigeben

Admin klickt auf `Freigeben`.

Frontend:

```text
js/admin_freigabe.js
```

sendet:

```json
{
  "admin_password": "...",
  "id": 5,
  "source": "pending",
  "action": "approve"
}
```

Backend:

```text
api/admin_approve_user.php
```

macht:

1. Admin-Passwort prüfen.
2. Pending-User laden.
3. Prüfen, ob Username bereits existiert.
4. In `users` einfügen.
5. `is_approved = 1` setzen.
6. Pending-Eintrag löschen.

### Ablehnen

Bei `reject` wird der Pending-Eintrag gelöscht.

### Sperren

Bei `suspend` wird kein User gelöscht.

Es wird nur gesetzt:

```sql
UPDATE users SET is_approved = 0 WHERE id = :id
```

Vorteil:

- Account bleibt vorhanden.
- Admin kann ihn später wieder freigeben.
- Historische Tipps bleiben erhalten.

## 16. Passwort-Reset Im Detail

### Token-Erstellung

`api/forgot_password.php` erzeugt einen sicheren Token.

Der echte Token wird nicht direkt in der Datenbank gespeichert.

Gespeichert wird:

```php
hash('sha256', $token)
```

Warum:

Wenn jemand Datenbankzugriff hätte, könnte er nicht einfach den Reset-Link verwenden.

### Ablaufzeit

Der Token ist 60 Minuten gültig:

```sql
DATE_ADD(NOW(), INTERVAL 60 MINUTE)
```

### Reset-Link

Der Link sieht ungefähr so aus:

```text
https://domain.at/reset_password.html?token=...
```

### Neues Passwort

`api/reset_password.php`:

1. liest Token
2. hasht Token
3. sucht gültigen Eintrag
4. hasht neues Passwort
5. speichert Passwort
6. markiert Token als benutzt
7. loggt User direkt ein

## 17. Tipps Speichern Im Detail

### Ehrentipp

Dateien:

- `tipps.html`
- `js/wm-tipps.js`
- `api/wm_place_tip.php`

Request:

```json
{
  "spiel_id": 5410,
  "tipp_home": 2,
  "tipp_away": 1
}
```

Backend prüft:

- User eingeloggt und freigegeben
- Spiel existiert
- Spiel ist `WM 2026`
- Spiel ist aktiv
- Spiel hat noch nicht begonnen
- Tore sind zwischen 0 und 20

Dann wird gespeichert:

```sql
INSERT INTO tipps (...)
ON DUPLICATE KEY UPDATE ...
```

Bedeutung:

- erster Tipp wird eingefügt
- späterer Tipp überschreibt den alten Tipp
- es gibt nicht mehrere Tipps desselben Users auf dasselbe Spiel

### Spaßtipp

Fast gleich, aber:

```sql
competition = 'Freundschaftsspiel'
```

und Spaßtipps zählen nicht ins Ranking.

## 18. Punkteberechnung Im Detail

Die Punkte werden nicht dauerhaft in einer Extra-Tabelle berechnet, sondern beim Ranking aus den Tipps und Ergebnissen gelesen.

### Exakt

```text
Tipp:     2:1
Ergebnis: 2:1
Punkte:   3
```

SQL-Bedingung:

```sql
t.tipp_home = s.score_home
AND t.tipp_away = s.score_away
```

### Tendenz Heimsieg

```text
Tipp:     2:1
Ergebnis: 1:0
Punkte:   1
```

Bedingung:

```sql
t.tipp_home > t.tipp_away
AND s.score_home > s.score_away
```

### Tendenz Auswärtssieg

```text
Tipp:     0:2
Ergebnis: 1:3
Punkte:   1
```

Bedingung:

```sql
t.tipp_home < t.tipp_away
AND s.score_home < s.score_away
```

### Tendenz Unentschieden

```text
Tipp:     1:1
Ergebnis: 2:2
Punkte:   1
```

Bedingung:

```sql
t.tipp_home = t.tipp_away
AND s.score_home = s.score_away
```

### Keine Punkte

Alles andere gibt 0 Punkte.

Offene Spiele geben ebenfalls 0 Punkte.

## 19. Ranking-SQL Im Detail

`api/ranking.php` baut eine große SQL-Abfrage.

Sie verbindet:

- `users`
- `tipps`
- `spiele`
- `wm_favorites`

Wichtige Berechnungen:

```sql
COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN t.spiel_id END) AS tips
```

Zählt alle WM-Tipps eines Users.

```sql
COUNT(DISTINCT CASE WHEN s.status = 'finished' THEN t.spiel_id END) AS finished_tips
```

Zählt Tipps auf fertige Spiele.

```sql
COUNT(DISTINCT CASE WHEN exakt richtig THEN t.spiel_id END) AS exact_tips
```

Zählt exakte Tipps.

```sql
SUM(CASE ... THEN 3 ... THEN 1 ELSE 0 END) AS points
```

Berechnet Punkte.

Sortierung:

```sql
ORDER BY points DESC, exact_tips DESC, tips ASC, u.username ASC
```

Bedeutung:

1. höchste Punkte zuerst
2. bei Gleichstand mehr exakte Tipps
3. danach weniger Tipps
4. danach Name

## 20. WM-Favorit-Bonus Im Detail

Der WM-Favorit ist in:

```text
wm_favorites
```

gespeichert.

Vor WM-Ende setzt `refresh_wm_favorite_points()` alle Bonuspunkte auf 0.

Grund:

Der Bonus soll nicht vorzeitig ins Ranking zählen.

Erst wenn alle aktiven WM-Spiele fertig sind:

```php
wm_all_matches_finished($pdo) === true
```

dann wird berechnet:

- Champion aus dem Finale
- Gesamt-Tore aus allen fertigen WM-Spielen
- Top-Torjäger aus `wm_results`

Dann:

```sql
points_champion = 25 oder 0
points_top_scorer = 25 oder 0
points_total_goals = 25 oder 0
```

## 21. Hall Of Fame Im Detail

Die Hall of Fame nutzt das normale Ranking.

API:

```php
'hall_of_fame' => $wmFavoriteResult['complete'] ? array_slice($rankingRows, 0, 3) : []
```

Bedeutung:

- WM nicht fertig: leeres Array
- WM fertig: erste 3 User aus Ranking

Frontend:

`js/ranking.js`

```js
renderHallOfFame(data.hall_of_fame || [], Boolean(data.wmFavoriteResult?.complete));
```

Wenn `complete=false`:

- `hallOfFameSection` bleibt `display:none`

Wenn `complete=true`:

- Top 3 werden angezeigt

## 22. Finalrunde-Sichtbarkeit Im Detail

Die KO-Runde enthält am Anfang Platzhalter:

```text
1. Gruppe A
Sieger 101
3. A/B/C/D/F
```

Diese sollen nicht angezeigt werden.

Deshalb prüft `isPlaceholderTeam()`:

```js
/^(\d+\.\s*)?Gruppe\s+[A-L]$/i
/^(Sieger|Verlierer|Winner|Loser)\s+\d+$/i
/^\d+\.\s*[A-L](\/[A-L])+/i
```

Erst wenn beide Teams keine Platzhalter sind, wird das KO-Spiel angezeigt.

## 23. Forum-Reactions Im Detail

Tabellen:

- `forum_messages`
- `forum_reactions`

Jede Nachricht kann viele Reaktionen haben.

Aber:

```sql
UNIQUE KEY uniq_forum_reaction (message_id, user_id)
```

verhindert mehrere Stimmen desselben Users auf dieselbe Nachricht.

### Like setzen

POST:

```json
{
  "message_id": 17,
  "reaction": "like"
}
```

### Dislike setzen

```json
{
  "message_id": 17,
  "reaction": "dislike"
}
```

### Gleiche Reaktion nochmal

Wenn User schon `like` hatte und nochmal `like` klickt:

```sql
DELETE FROM forum_reactions
```

Die Stimme wird entfernt.

### Reaktion wechseln

Wenn User `like` hatte und `dislike` klickt:

```sql
ON DUPLICATE KEY UPDATE reaction = VALUES(reaction)
```

Die Stimme wird geändert.

## 24. HTML-Sicherheit Im Frontend

Usernamen und Nachrichten kommen aus der Datenbank.

Damit niemand HTML oder JavaScript einschleust, gibt es Funktionen wie:

```js
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
```

Beispiel:

```html
<script>alert(1)</script>
```

wird sichtbar gemacht, aber nicht ausgeführt.

## 25. Fehlerbehandlung

PHP gibt Fehler als JSON zurück:

```php
out(['ok' => false, 'error' => 'Bitte zuerst einloggen.'], 401);
```

JavaScript macht daraus:

```js
if (!response.ok) throw new Error(json.error || "Fehler");
```

Dann wird je nach Stelle:

- eine Meldung angezeigt
- ein `alert()` gezeigt
- ein Formular deaktiviert
- eine Tabelle mit Fehlermeldung ersetzt

## 26. Warum Manche Tabellen Automatisch Angelegt Werden

Mehrere APIs enthalten `CREATE TABLE IF NOT EXISTS`.

Beispiele:

- `pending_users`
- `password_resets`
- `forum_reactions`
- `wm_favorites`
- `wm_results`

Vorteil:

- Projekt läuft auch, wenn im SQL-Backup eine neue Tabelle fehlt.
- Beim ersten API-Aufruf wird die Tabelle erstellt.

Nachteil:

- Auf einer echten Domain sollte man trotzdem ein sauberes SQL-Backup importieren.

## 27. Wichtige Stellen Für Die Präsentation

Wenn du erklären musst, was dein Projekt kann, zeige diese Dateien:

### Registrierung

- `index.html`
- `js/app.js`
- `api/register.php`
- `api/admin_approve_user.php`

### Punkteberechnung

- `api/ranking.php`
- `api/my_stats.php`

### Admin-Bereich

- `admin_freigabe.html`
- `js/admin_freigabe.js`
- `api/admin_pending_users.php`
- `api/admin_approve_user.php`

### Forum

- `forum.html`
- `js/forum.js`
- `api/forum_messages.php`

### Hall of Fame

- `ranking.html`
- `js/ranking.js`
- `api/ranking.php`

### Passwort vergessen

- `index.html`
- `reset_password.html`
- `api/forgot_password.php`
- `api/reset_password.php`

## 28. Was Beim Hochladen Wichtig Ist

Code, der lokal funktioniert, braucht auf der Domain:

- richtige Datenbankdaten in `api/db.php` oder Env-Variablen
- importierte Datenbank
- funktionierende PHP-Version
- Mailserver für Passwort-Reset
- HTTPS
- geschützte Backup-Ordner

## 29. Kurze Entwickler-Checkliste

Nach Codeänderungen:

1. Datei speichern.
2. Wenn CSS/JS geändert wurde, Version in HTML erhöhen.
3. Datei nach XAMPP kopieren.
4. Browser mit `Strg + F5` neu laden.
5. PHP-Dateien mit `php -l` prüfen.
6. Wichtige API im Browser oder mit `curl` testen.

Beispiel:

```text
http://localhost/glücksball%202.0/api/ranking.php
```
