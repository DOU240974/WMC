# Ablauf-Tutorial: GlücksBall

## Ziel der Demo

In der Demo soll gezeigt werden, dass GlücksBall eine funktionierende Web-App ist. Benutzer können sich registrieren, einloggen, Spiele ansehen, Tipps abgeben, Ranking anschauen und eigene Statistiken prüfen.

## Vorbereitung

1. XAMPP starten.
2. Apache und MySQL starten.
3. Projekt im Browser öffnen:

```text
http://localhost/Glücksball%202.0/
```

4. Browser mit `Strg + F5` neu laden, damit aktuelle CSS- und JS-Dateien geladen werden.

## Demo-Ablauf

### 1. Startseite zeigen

Öffne `index.html`.

Zeigen:

- Titel und Navigation.
- Login-Bereich.
- Registrierung.
- Fußball-News.
- Kommende Nationalspiele.
- Darkmode/Lightmode-Schalter.

Erklären:

- Die News und kommenden Spiele werden nicht statisch geladen, sondern über JavaScript und `fetch()`.
- Die kommenden Spiele werden aus API-Daten als DOM-Karten erzeugt.

### 2. Navigation ohne Login testen

Klicke auf `Ehrentipps` oder `Ranking`, ohne eingeloggt zu sein.

Erwartung:

- Die Seite wird blockiert.
- Es erscheint die Meldung: `Bitte zuerst einloggen.`

Erklären:

- Geschützte Bereiche sind nur für eingeloggte Benutzer erreichbar.

### 3. Einloggen

Oben auf `Login` klicken.

Dann Benutzerdaten eingeben.

Nach erfolgreichem Login:

- Die LED wird grün.
- Der Benutzername erscheint.
- Die geschützten Seiten sind erreichbar.

### 4. Ehrentipps-Seite zeigen

Öffne `tipps.html`.

Zeigen:

- WM-Favorit-Box.
- Gruppenfilter.
- Spielkarten.
- Eingabefelder für Tipps.
- Speichern-Button.

Erklären:

- Die Gruppenfilter entstehen aus einem JavaScript-Array.
- Die Spielkarten werden aus API-Daten dynamisch erzeugt.
- Tipps werden mit `fetch()` an PHP gesendet und in der Datenbank gespeichert.

### 5. WM-Favorit zeigen

Zeige die Box `WM-Favorit`.

Erklären:

- Benutzer können Weltmeister, Top-Torjäger und Gesamt-Tore tippen.
- Diese Daten werden über `api/wm_favorite.php` geladen und gespeichert.

### 6. Ranking-Seite zeigen

Öffne `ranking.html`.

Zeigen:

- Ranking-Tabelle.
- Punkte.
- Anzahl der Tipps.
- Trefferquote.
- WM-Favoriten-Tabelle.

Erklären:

- Die Daten kommen aus `api/ranking.php`.
- JavaScript sortiert und rendert Tabellenzeilen.

### 7. Statistik-Seite zeigen

Klicke auf den Benutzernamen oder öffne `statistik.html`.

Zeigen:

- Profilinformationen.
- Zusammenfassung.
- Eigene Ehrentipps.
- Eigene Spaßtipps.

Erklären:

- Die Seite verwendet `api/my_stats.php`.
- Die Tabellen werden dynamisch mit JavaScript erstellt.

### 8. Logout zeigen

Klicke auf `Logout`.

Danach:

- Login-LED wird rot.
- Benutzername verschwindet.
- Ranking und Tipps sind wieder gesperrt.

## Code-Erklärung im Video

Für die Codebesprechung können diese Stellen gezeigt werden:

- `js/app.js`: Login, Theme, News und kommende Spiele.
- `js/wm-tipps.js`: Tippkarten, Filter und Speichern.
- `js/ranking.js`: Ranking laden und Tabellen rendern.
- `api/`: PHP-Dateien als JSON-Schnittstellen.
- `css/style.css`: Layout, Karten, Tabellen, responsive Design.

## Wichtige Punkte für die Präsentation

- Die App ist nicht nur statisches HTML.
- JavaScript lädt Daten dynamisch.
- PHP liefert JSON.
- DOM-Elemente werden erzeugt und ersetzt.
- Es gibt Login-Schutz.
- Es gibt mehrere Seiten.
- Es gibt echte Interaktion mit Speichern und Ranking.

## Möglicher Sprechtext

```text
Mein Projekt heißt GlücksBall. Es ist ein Tippspiel für die WM 2026.
Auf der Startseite sieht man News und kommende Spiele. Diese Daten werden mit fetch geladen.
Wenn man nicht eingeloggt ist, kann man Ranking und Tipps nicht öffnen.
Nach dem Login kann man auf der Tipps-Seite Ergebnisse und einen WM-Favoriten speichern.
Auf der Ranking-Seite sieht man die Punkte aller Benutzer.
Auf der Statistik-Seite sieht man die eigenen Tipps und Punkte.
Technisch verwende ich HTML, CSS, JavaScript, fetch, DOM-Manipulation und PHP-APIs.
```

