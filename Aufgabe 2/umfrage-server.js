// Installiere zuerst: npm install express sqlite3 body-parser
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '.'))); // Statische Dateien aus aktuellem Ordner

// Datenbank anlegen
const db = new sqlite3.Database('umfrage.db');
db.run('CREATE TABLE IF NOT EXISTS votes (id INTEGER PRIMARY KEY, favorit TEXT)');

// Umfrage-Antwort speichern
app.post('/vote', (req, res) => {
  const favorit = req.body.favorit;
  if (favorit) {
    db.run('INSERT INTO votes (favorit) VALUES (?)', [favorit], function(err) {
      if (err) return res.status(500).send('Fehler');
      res.send('Abstimmung gespeichert!');
    });
  } else {
    res.status(400).send('Kein Favorit angegeben');
  }
});

// Statistik abrufen
app.get('/stats', (req, res) => {
  db.all('SELECT favorit, COUNT(*) as stimmen FROM votes GROUP BY favorit', (err, rows) => {
    if (err) return res.status(500).send('Fehler');
    res.json(rows);
  });
});

app.listen(3000, () => console.log('Server läuft auf Port 3000'));
