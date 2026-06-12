# Code-Erklärung: GlücksBall

## Projektidee

GlücksBall ist ein Fußball-Tippspiel für die WM 2026. Benutzer können sich registrieren, einloggen, Spiele ansehen, Tipps abgeben, einen WM-Favoriten speichern und ein Ranking vergleichen.

Das Projekt besteht aus HTML, CSS, client-side JavaScript und PHP-API-Dateien für Datenbankzugriff und Authentifizierung.

## Seitenübersicht

- `index.html`: Startseite mit Registrierung, Login, Fußball-News und kommenden Spielen.
- `tipps.html`: Seite für WM-Tipps, Gruppenspiele, KO-Spiele und WM-Favorit.
- `ranking.html`: Ranking aller Benutzer und Übersicht der WM-Favoriten.
- `statistik.html`: persönliche Statistik des eingeloggten Benutzers.

## JavaScript-Struktur

### `js/app.js`

Diese Datei wird auf allen Seiten verwendet.

Wichtige Aufgaben:

- Theme umschalten zwischen Darkmode und Lightmode.
- Login-Status über `api/me.php` laden.
- Login und Logout steuern.
- Navigation zu geschützten Seiten blockieren, wenn man nicht eingeloggt ist.
- Fußball-News über `api/fussball_news.php` laden.
- Kommende Spiele über `api/upcoming_matches.php` laden.
- DOM-Elemente für News und Spiele dynamisch erzeugen.

Beispiele für verwendete Technologien:

- `fetch()` für API-Aufrufe.
- `document.createElement()` zum Erzeugen von DOM-Nodes.
- `replaceChildren()` zum Austauschen von Inhalten.
- Arrays mit `.map()`, `.filter()` und `.sort()`.

### `js/wm-tipps.js`

Diese Datei steuert die Tippseite.

Wichtige Aufgaben:

- Prüfen, ob der Benutzer eingeloggt ist.
- WM-Spiele über `api/wm_matches_v2.php` laden.
- Gruppenspiele nach Gruppen filtern.
- Tippkarten dynamisch rendern.
- Tipps über `api/wm_place_tip.php` speichern.
- WM-Favorit über `api/wm_favorite.php` laden und speichern.
- Abgelaufene Tippkarten entfernen.

Besonders wichtig:

- Die Karten werden nicht statisch in HTML geschrieben, sondern aus API-Daten per JavaScript erzeugt.
- Die Filterbuttons entstehen aus dem Array `GROUPS`.
- KO-Spiele werden nur angezeigt, wenn echte Mannschaften feststehen.

### `js/ranking.js`

Diese Datei steuert die Ranking-Seite.

Wichtige Aufgaben:

- Prüfen, ob der Benutzer eingeloggt ist.
- Rankingdaten über `api/ranking.php` laden.
- Ranking nach Punkten, exakten Tipps und weiteren Kriterien sortieren.
- Tabellenzeilen dynamisch erzeugen.
- WM-Favoriten und Hall of Fame anzeigen.

### `js/statistik.js`

Diese Datei steuert die Statistik-Seite.

Wichtige Aufgaben:

- Prüfen, ob der Benutzer eingeloggt ist.
- Persönliche Statistik über `api/my_stats.php` laden.
- Tabellen für Ehrentipps und Spaßtipps dynamisch aufbauen.
- Flaggen und Teamnamen anzeigen.

## PHP-API

Die PHP-Dateien im Ordner `api/` liefern JSON-Daten an das Frontend.

Wichtige Dateien:

- `db.php`: Verbindung zur Datenbank.
- `login.php`: Benutzer einloggen.
- `logout.php`: Benutzer ausloggen.
- `register.php`: neuen Benutzer registrieren.
- `me.php`: aktuellen Login-Status zurückgeben.
- `wm_matches_v2.php`: WM-Spiele liefern.
- `wm_place_tip.php`: Tipps speichern.
- `wm_favorite.php`: WM-Favorit laden und speichern.
- `ranking.php`: Ranking und Favoritenwertung berechnen.
- `my_stats.php`: persönliche Statistik liefern.
- `upcoming_matches.php`: kommende Spiele für die Startseite liefern.
- `fussball_news.php`: Fußball-News für die Startseite liefern.

## Datenfluss

1. Der Browser lädt eine HTML-Seite.
2. Die Seite lädt CSS und JavaScript.
3. JavaScript fragt mit `fetch()` eine PHP-API ab.
4. PHP liest oder schreibt Daten in der Datenbank.
5. PHP gibt JSON zurück.
6. JavaScript rendert daraus neue DOM-Elemente.

Beispiel:

```text
index.html -> app.js -> fetch(api/upcoming_matches.php) -> JSON -> Spielkarten im DOM
```

## Schutz von Seiten

`tipps.html` und `ranking.html` sind nur für eingeloggte Benutzer erreichbar.

- Die Navigation blockiert diese Links ohne Login.
- Beim direkten Aufruf prüfen `wm-tipps.js` und `ranking.js` den Login-Status über `api/me.php`.
- Wenn kein Login vorhanden ist, wird zurück zu `index.html` geleitet.

## Erfüllte Anforderungen

- Client-side JavaScript ist vorhanden.
- `fetch()` wird mehrfach verwendet.
- DOM-Nodes werden erzeugt, ausgetauscht und entfernt.
- Arrays werden verwendet.
- Es gibt mehr als drei Unterseiten.
- Die Anwendung nutzt dynamische Daten statt nur statischem HTML.

