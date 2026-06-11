# GlücksBall Dokumentation

GlücksBall ist ein Fußball-Tippspiel für Freunde, Familie und Bekannte. Es gibt Registrierung, Admin-Freigabe, Ehrentipps, Spaßtipps, persönliche Statistiken, Ranking, Forum, Passwort-Reset und eine Hall of Fame.

## 1. Voraussetzungen

- PHP 8.1 oder neuer
- MySQL oder MariaDB
- Apache oder anderer Webserver mit PHP
- HTTPS auf der Domain
- Mailserver oder PHP `mail()` für Passwort-Reset-E-Mails

Lokal wurde das Projekt mit XAMPP getestet.

## 2. Wichtige Dateien

- `index.html`: Startseite mit Registrierung, News und kommenden Spielen
- `tipps.html`: Ehrentipps und WM-Favorit
- `spasstipp.html`: Spaßtipps
- `ranking.html`: Ehren-Ranking, WM-Favoriten und Hall of Fame
- `statistik.html`: persönliche User-Statistik
- `forum.html`: Forum mit Likes und Dislikes
- `regeln.html`: Regeln und rechtliche Hinweise
- `admin_freigabe.html`: Admin-Bereich für Freigaben und Sperren
- `api/`: Backend-Dateien
- `css/style.css`: gemeinsames Design
- `js/`: Frontend-Logik
- `datenbank_backup/`: SQL-Backups, nicht öffentlich verlinken

## 3. Datenbank

Beim Hoster eine neue Datenbank anlegen und ein SQL-Backup importieren, zum Beispiel:

- `datenbank_backup/gbdatenbank (100626).sql`
- oder dein aktuellstes Backup aus `datenbank_backup/`

Die App legt einige Tabellen automatisch an, falls sie fehlen:

- `pending_users`: noch nicht freigegebene Registrierungen
- `password_resets`: Passwort-zurücksetzen-Tokens
- `wm_favorites`: WM-Favoriten
- `wm_results`: echter Top-Torjäger nach WM-Ende
- `forum_messages`: Forum-Nachrichten
- `forum_reactions`: Likes und Dislikes im Forum

## 4. Datenbank-Zugang

Die Verbindung steht in `api/db.php`.

Lokal sind die XAMPP-Werte aktiv:

- Host: `127.0.0.1`
- Datenbank: `gbdatenbank`
- User: `root`
- Passwort: leer

Auf der Domain entweder in `api/db.php` anpassen oder beim Hoster Umgebungsvariablen setzen:

- `GB_DB_HOST`
- `GB_DB_NAME`
- `GB_DB_USER`
- `GB_DB_PASS`
- `GB_DB_CHARSET`

Empfohlen: Wenn dein Hoster Umgebungsvariablen unterstützt, diese verwenden. Dann stehen keine Zugangsdaten direkt im Code.

## 5. Dateien Hochladen

Den Inhalt des Projektordners in den Webspace laden, meistens:

- `public_html`
- `htdocs`
- `www`

Nicht öffentlich nötig sind:

- `datenbank_backup/`
- `Auftrag/`
- lokale Testdateien
- `data/password_reset_links.txt`

Die `.htaccess` schützt diese Bereiche zusätzlich, wenn Apache `.htaccess` erlaubt.

## 6. Admin-Bereich

Seite:

`admin_freigabe.html`

Admin-Passwort:

`Bizerte95`

Funktionen:

- offene Registrierungen anzeigen
- User freigeben
- Registrierungen ablehnen
- aktive User anzeigen
- aktive User wieder sperren

Wichtig: Auf der Admin-Seite sieht man die User-Verwaltung erst nach Eingabe des Admin-Passworts.

Admin-Passwort ändern:

`api/admin_config.php`

```php
const ADMIN_PASSWORD = 'NeuesPasswort';
```

## 7. Registrierung und Login

Neue User landen zuerst in `pending_users`.

Ablauf:

1. User registriert sich auf `index.html`.
2. Admin öffnet `admin_freigabe.html`.
3. Admin gibt User frei.
4. User kann sich einloggen und tippen.

Wenn ein aktiver User gesperrt wird:

- `is_approved` wird auf `0` gesetzt.
- Der User kann sich danach nicht mehr normal anmelden.

## 8. Passwort Vergessen

Seiten und APIs:

- `index.html`: Passwort-vergessen-Formular im Login
- `reset_password.html`: neues Passwort setzen
- `api/forgot_password.php`: Reset-Link erstellen und E-Mail senden
- `api/reset_password.php`: Passwort speichern

Lokal mit XAMPP:

- XAMPP sendet meistens keine echten E-Mails.
- Deshalb wird der Reset-Link lokal im Browser angezeigt.
- Zusätzlich wird der Link in `data/password_reset_links.txt` gespeichert.

Auf der Domain:

- Wenn PHP `mail()` funktioniert, wird der Reset-Link per E-Mail verschickt.
- Falls nicht, muss SMTP/PHPMailer eingerichtet werden.
- Sobald du Mailserver-Zugangsdaten vom Hoster bekommst, kann die Mail-Funktion auf SMTP umgebaut werden.

## 9. Ehrentipps und Punkte

Ehrentipps zählen für das Ehren-Ranking.

Punkte:

- exaktes Ergebnis: `3 Punkte`
- richtige Tendenz: `1 Punkt`
- falsch: `0 Punkte`
- offene Spiele: `0 Punkte`

Beispiele:

- Tipp `2:1`, Ergebnis `2:1` = 3 Punkte
- Tipp `2:1`, Ergebnis `1:0` = 1 Punkt
- Tipp `1:1`, Ergebnis `2:2` = 1 Punkt
- Tipp `1:0`, Ergebnis `0:1` = 0 Punkte

Bei Gleichstand im Ranking:

1. mehr Punkte
2. mehr exakte Tipps
3. weniger abgegebene Tipps
4. Username alphabetisch

## 10. Spaßtipps

Spaßtipps sind getrennt von Ehrentipps.

Sie erscheinen in der User-Statistik, zählen aber nicht für das Ehren-Ranking.

## 11. WM-Favorit

Auf `tipps.html` kann vor dem ersten WM-Spiel getippt werden:

- Weltmeister
- Top-Torjäger
- gesamte WM-Tore

Jede richtige Kategorie bringt `25 Punkte`.

Diese Bonuspunkte zählen aber erst nach dem letzten WM-Spiel automatisch ins Ranking.

Automatisch berechnet werden:

- Weltmeister aus dem Finale
- gesamte Tore aus allen fertigen WM-Spielen

Top-Torjäger:

- muss nach WM-Ende in `wm_results.top_scorer` eingetragen werden
- danach kann die Ranking-API die 25 Punkte automatisch vergeben

## 12. Finalrunde

Die Finalrunde auf `tipps.html` ist erst sichtbar, wenn echte Mannschaften feststehen.

Platzhalter wie diese werden versteckt:

- `1. Gruppe A`
- `2. Gruppe B`
- `3. A/B/C/D/F`
- `Sieger 101`
- `Verlierer 102`

Sobald echte Teams in der Datenbank stehen, erscheinen die KO-Spiele automatisch.

## 13. Ranking und Hall of Fame

`ranking.html` zeigt:

- Ehren-Ranking
- WM-Favoriten
- Hall of Fame

Die Hall of Fame ist vor WM-Ende komplett unsichtbar.

Nach WM-Ende zeigt sie automatisch die Top 3 des Ehren-Rankings:

1. Platz
2. Platz
3. Platz

Die Daten kommen aus `api/ranking.php`.

## 14. Forum

Das Forum unterstützt:

- Nachrichten schreiben
- Nachrichten lesen
- Likes
- Dislikes

Regeln:

- Schreiben nur eingeloggt
- Like/Dislike nur eingeloggt
- ein User kann pro Nachricht nur eine Stimme haben
- nochmal klicken entfernt die Stimme
- Wechsel von Like zu Dislike ist möglich

## 15. News

Die Startseite lädt Fußball-News über `api/news.php`.

Auf `index.html` werden aktuell 4 News angezeigt.

Die News-Seite zeigt mehr Beiträge.

## 16. Lokaler Test mit XAMPP

Projektordner zum Beispiel nach XAMPP kopieren:

`C:\xampp2\htdocs\Glücksball 2.0`

Dann im Browser öffnen:

`http://localhost/glücksball%202.0/index.html`

Nach Änderungen im Browser oft nötig:

`Strg + F5`

## 17. Live-Test nach Upload

Nach dem Upload auf die Domain diese Punkte testen:

- Startseite öffnet
- Registrierung funktioniert
- Admin-Freigabe funktioniert
- Login funktioniert
- aktive User sperren funktioniert
- Passwort vergessen sendet E-Mail
- Reset-Link setzt Passwort
- Ehrentipp speichern funktioniert
- Spaßtipp speichern funktioniert
- Statistik lädt
- Ranking lädt
- Forum-Nachricht schreiben funktioniert
- Like/Dislike im Forum funktioniert
- Regeln-Seite lädt
- Bilder laden

## 18. Sicherheitshinweise

- Admin-Passwort nach Projektabgabe oder Livegang ändern.
- Datenbank-Backups nicht öffentlich hochladen oder per `.htaccess` schützen.
- HTTPS aktivieren.
- Keine Datenbank-Fehlermeldungen öffentlich anzeigen.
- Keine privaten Daten im Forum posten.
- Regelmäßig Datenbank sichern.

## 19. Backup

Vor größeren Änderungen:

1. Datenbank exportieren.
2. Projektordner sichern.
3. Erst danach neue Version hochladen.

Empfohlene Backup-Namen:

`gbdatenbank_YYYY-MM-DD.sql`

und:

`gluecksball_YYYY-MM-DD.zip`

## 20. Typische Probleme

Bild wird nicht angezeigt:

- Prüfen, ob die Datei im `image/`-Ordner liegt.
- Prüfen, ob sie auch im XAMPP- oder Webserver-Ordner liegt.
- Pfad im HTML prüfen.

Änderung wird nicht sichtbar:

- Browser-Cache mit `Strg + F5` leeren.
- Versionen bei CSS/JS erhöhen, zum Beispiel `style.css?v=13`.

Passwort-Reset-Mail kommt nicht:

- Auf XAMPP normal.
- Auf Domain Mailserver/PHP `mail()` prüfen.
- Später SMTP einrichten, falls der Hoster `mail()` blockiert.

Ranking zeigt 0 Punkte:

- Spiele müssen `status = finished` haben.
- `score_home` und `score_away` müssen gesetzt sein.

Hall of Fame fehlt:

- Normal vor WM-Ende.
- Sie erscheint erst, wenn alle aktiven WM-Spiele fertig sind.

Finalrunde fehlt:

- Normal, solange dort Platzhalter stehen.
- Sie erscheint erst mit echten Mannschaftsnamen.
