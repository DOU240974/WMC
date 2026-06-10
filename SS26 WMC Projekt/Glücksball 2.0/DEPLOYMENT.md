# GluecksBall auf Domain hochladen

## 1. Hosting vorbereiten

- Hosting braucht PHP 8.1+ und MySQL/MariaDB.
- Domain sollte per HTTPS erreichbar sein.
- Beim Hoster eine neue Datenbank anlegen.

## 2. Datenbank importieren

- Importiere `datenbank_backup/gbdatenbank (3).sql` in die neue Datenbank.
- Fehlende Tabellen wie `pending_users`, `wm_favorites` und `password_resets` erstellt die App automatisch.

## 3. Datenbankzugang setzen

In `api/db.php` bleiben lokal die XAMPP-Werte aktiv. Auf der Domain entweder die Fallback-Werte in `api/db.php` anpassen oder beim Hoster Umgebungsvariablen setzen:

- `GB_DB_HOST`
- `GB_DB_NAME`
- `GB_DB_USER`
- `GB_DB_PASS`
- `GB_DB_CHARSET`

## 4. Dateien hochladen

Lade den Inhalt von `Gluecksball 2.0` bzw. `Glücksball 2.0` in den Webspace, meistens `public_html`, `htdocs` oder `www`.

Nicht öffentlich gebraucht werden:

- `datenbank_backup/`
- `Auftrag/`
- `data/password_reset_links.txt`

Die `.htaccess` blockiert diese Pfade zusätzlich, wenn Apache `mod_rewrite` aktiv hat.

## 5. Admin

Admin-Freigabe:

- Seite: `admin_freigabe.html`
- Passwort: `Bizerte95`

Nach dem ersten Live-Test kannst du das Passwort in `api/admin_config.php` jederzeit ändern.

## 6. Passwort vergessen / E-Mail

Lokal zeigt die App den Reset-Link direkt an, weil XAMPP ohne SMTP keine echten E-Mails verschickt.

Auf der Domain:

- Wenn der Hoster PHP `mail()` unterstützt, kommt der Link per E-Mail.
- Falls nicht, SMTP/PHPMailer einrichten.
- Der Reset-Link wird nur auf `localhost` im Browser angezeigt.

## 7. Live-Test

Teste nach dem Upload:

- Registrierung
- Admin-Freigabe
- Login
- Passwort vergessen
- Tipp abgeben
- Statistik
- Ranking
