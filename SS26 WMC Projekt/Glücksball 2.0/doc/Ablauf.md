# GlücksBall Ablauf

Diese Datei erklärt den Ablauf der App aus Benutzersicht und aus technischer Sicht.

## 1. Startseite

Der Einstieg ist `index.html`.

Auf der Startseite sieht man:

- Fußball-News
- Registrierung
- Login
- Passwort vergessen
- kommende Spiele

Technisch:

- `js/app.js` kümmert sich um Login, Logout, Registrierung, Theme, News und kommende Spiele.
- Registrierung geht an `api/register.php`.
- Login geht an `api/login.php`.
- Passwort vergessen geht an `api/forgot_password.php`.

## 2. Registrierung

Ablauf:

1. User gibt Benutzername, E-Mail und Passwort ein.
2. `api/register.php` prüft die Eingaben.
3. Passwort wird gehasht.
4. User landet zuerst in `pending_users`.
5. Der User kann noch nicht tippen.

Warum:

Damit nur freigegebene Personen am Tippspiel teilnehmen.

## 3. Admin-Freigabe

Seite:

`admin_freigabe.html`

Ablauf:

1. Admin gibt das Admin-Passwort ein.
2. `js/admin_freigabe.js` lädt über `api/admin_pending_users.php` offene und aktive User.
3. Ohne korrektes Passwort bleibt die Verwaltung unsichtbar.
4. Admin kann offene User freigeben oder ablehnen.
5. Admin kann aktive User wieder sperren.

Technisch:

- Freigeben kopiert einen User aus `pending_users` in `users`.
- Sperren setzt `users.is_approved` auf `0`.
- Gesperrte User können sich nicht mehr normal anmelden.

## 4. Login

Ablauf:

1. User gibt Benutzername und Passwort ein.
2. `api/login.php` prüft das Passwort.
3. Danach wird geprüft, ob `is_approved = 1` ist.
4. Wenn alles passt, wird eine PHP-Session gestartet.

Technisch:

- Die Session speichert `user_id` und `username`.
- Viele APIs prüfen danach über `auth_guard.php`, ob der User freigegeben ist.

## 5. Passwort Vergessen

Ablauf:

1. User klickt auf `Passwort vergessen?`.
2. User gibt Benutzername und E-Mail ein.
3. `api/forgot_password.php` erstellt einen Token.
4. Link geht per E-Mail raus.
5. User öffnet `reset_password.html`.
6. `api/reset_password.php` setzt das neue Passwort.
7. Danach ist der User direkt eingeloggt.

Lokal:

Auf XAMPP wird der Reset-Link zusätzlich angezeigt und in `data/password_reset_links.txt` gespeichert, weil XAMPP meistens keine E-Mails verschickt.

## 6. Ehrentipps

Seite:

`tipps.html`

Ablauf:

1. Spiele kommen aus `api/wm_matches_v2.php`.
2. User gibt Tipp ein.
3. Tipp wird an `api/wm_place_tip.php` gesendet.
4. Tipp wird in `tipps` gespeichert.
5. Nach Spielbeginn ist der Tipp gesperrt.

Punkte:

- exaktes Ergebnis: 3 Punkte
- richtige Tendenz: 1 Punkt
- falsch: 0 Punkte

## 7. Finalrunde

Die Finalrunde auf `tipps.html` ist erst sichtbar, wenn echte Teams feststehen.

Nicht sichtbar sind Platzhalter wie:

- `1. Gruppe A`
- `2. Gruppe B`
- `3. A/B/C/D/F`
- `Sieger 101`
- `Verlierer 102`

Technisch:

- `js/wm-tipps.js` prüft mit `isPlaceholderTeam()`, ob noch Platzhalter vorhanden sind.
- `renderKnockoutMatches()` rendert nur KO-Spiele mit echten Mannschaftsnamen.

## 8. WM-Favorit

Vor dem ersten WM-Spiel kann jeder User tippen:

- Weltmeister
- Top-Torjäger
- gesamte Tore

Ablauf:

1. Eingabe auf `tipps.html`.
2. Speicherung über `api/wm_favorite.php`.
3. Nach Beginn des ersten WM-Spiels wird das Formular gesperrt.
4. Punkte werden erst nach dem letzten WM-Spiel berechnet.

Bonus:

- Weltmeister richtig: 25 Punkte
- Top-Torjäger richtig: 25 Punkte
- Gesamt-Tore richtig: 25 Punkte

Wichtig:

Top-Torjäger muss nach der WM in `wm_results.top_scorer` eingetragen werden.

## 9. Spaßtipps

Seite:

`spasstipp.html`

Spaßtipps laufen separat.

Sie werden in der Statistik angezeigt, zählen aber nicht für das Ehren-Ranking.

## 10. Statistik

Seite:

`statistik.html`

Ablauf:

1. User muss eingeloggt sein.
2. `api/my_stats.php` lädt alle Tipps des Users.
3. Ehrentipps und Spaßtipps werden getrennt.
4. Punkte, Trefferquote, exakte Tipps und falsche Tipps werden angezeigt.

## 11. Ranking

Seite:

`ranking.html`

Ablauf:

1. `js/ranking.js` lädt `api/ranking.php`.
2. `api/ranking.php` berechnet Punkte direkt aus den Tipps und Ergebnissen.
3. Admin wird im Ranking ausgeblendet.
4. WM-Favorit-Bonus zählt erst nach WM-Ende.

Sortierung:

1. mehr Punkte
2. mehr exakte Tipps
3. weniger Tipps
4. Username alphabetisch

## 12. Hall of Fame

Die Hall of Fame ist vor WM-Ende unsichtbar.

Ablauf:

1. `api/ranking.php` prüft, ob alle WM-Spiele fertig sind.
2. Wenn ja, werden die Top 3 aus dem Ehren-Ranking geliefert.
3. `js/ranking.js` zeigt die Hall of Fame erst dann an.

## 13. Forum

Seite:

`forum.html`

Ablauf:

1. Nachrichten werden über `api/forum_messages.php` geladen.
2. Eingeloggte User können Nachrichten schreiben.
3. Eingeloggte User können Like oder Dislike geben.
4. Pro User und Nachricht gibt es nur eine Reaktion.
5. Nochmal klicken entfernt die Reaktion.
6. Wechsel zwischen Like und Dislike ist möglich.

Technisch:

- Nachrichten: `forum_messages`
- Reaktionen: `forum_reactions`

## 14. Regeln

Seite:

`regeln.html`

Hier stehen:

- Ehrentipps
- WM-Favorit
- Spaßtipps
- Meisterschaften
- Ranking
- User-Statistik
- Forum
- Fair Play
- Rechtlicher Hinweis
- Datenschutz
- Betreiberentscheidung

## 15. Datenfluss Kurzform

Registrierung:

`index.html` -> `js/app.js` -> `api/register.php` -> `pending_users`

Admin-Freigabe:

`admin_freigabe.html` -> `js/admin_freigabe.js` -> `api/admin_approve_user.php` -> `users`

Login:

`index.html` -> `js/app.js` -> `api/login.php` -> PHP-Session

Ehrentipp:

`tipps.html` -> `js/wm-tipps.js` -> `api/wm_place_tip.php` -> `tipps`

Ranking:

`ranking.html` -> `js/ranking.js` -> `api/ranking.php` -> Tabellenanzeige

Forum:

`forum.html` -> `js/forum.js` -> `api/forum_messages.php` -> `forum_messages` und `forum_reactions`

Passwort vergessen:

`index.html` -> `api/forgot_password.php` -> E-Mail-Link -> `reset_password.html` -> `api/reset_password.php`

## 16. Wann Was Sichtbar Ist

Admin-Verwaltung:

Erst nach Admin-Passwort.

Finalrunde:

Erst wenn echte Mannschaften feststehen.

Hall of Fame:

Erst nach dem letzten WM-Spiel.

WM-Favorit-Bonus:

Erst nach dem letzten WM-Spiel.

Statistik:

Nur eingeloggt.

Forum schreiben und bewerten:

Nur eingeloggt.
