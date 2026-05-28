/* =========================================================
   AFCON – Anzeige + Tipps (ein Script für beide Seiten)
   - afcon.html: Gruppen, KO-Liste, Torjäger (JSON: data/afcon.json)
   - tipps.html: KO-Tipp-Cards (DB: api/ko_matches.php + api/my_bets.php)
   JSON-Struktur (gecleant):
   - teams[]: { name, iso2, flag }
   - groups[].table[]: { team, p,w,d,l,gf,ga,gd,pts }  (keine flag mehr in rows)
   - knockout[].matches[]:
       home/away = { name, iso2 }  oder (wenn noch nicht fix) { label }
       venue = { stadium, city }
   ========================================================= */

let AFCON = null;                         // enthält nach dem Laden das komplette afcon.json Objekt
let TEAMS_MAP = Object.create(null);      // Lookup: Teamname -> Team-Objekt aus AFCON.teams[]

const state = {
  tournament: "AFCON",
  user: null,
  myBets: {},
  lastSavedBet: null
};

/* ---------- Helpers ---------- */

function saveState() {
  localStorage.setItem("gluecksball_state", JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem("gluecksball_state");

  if (saved) {
    Object.assign(state, JSON.parse(saved));
  }
}

/**
 * getEl: sucht das erste DOM-Element, das zu einem der IDs passt
 * Vorteil: du kannst mehrere mögliche IDs übergeben (z.B. "groupsContainer" ODER "groups")
 */
function getEl(...ids) {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

/**
 * escapeHtml: schützt gegen HTML-Injection, indem Sonderzeichen ersetzt werden.
 * Wichtig, wenn du Daten aus JSON/DB direkt in innerHTML schreibst.
 */
function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * makeFlagHtml: erzeugt HTML für Flagge
 * - wenn flagUrl fehlt: Placeholder-DIV
 * - wenn Bild nicht lädt: fallback auf image/flag-placeholder.png
 */
function makeFlagHtml(flagUrl) {
  const safe = escapeHtml(flagUrl || "");
  if (!safe) return `<div class="flag placeholder" title="Keine Flagge"></div>`;
  return `<img class="flag" src="${safe}" alt="" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">`;
}

/**
 * stageLabel: Übersetzt KO-Runden-Bezeichnungen auf Deutsch
 * Falls unbekannt: gibt den ursprünglichen Text zurück.
 */
function stageLabel(stage) {
  const map = {
    "Round of 16": "Achtelfinale",
    "Quarter-finals": "Viertelfinale",
    "Semi-finals": "Halbfinale",
    "Third place play-off": "Spiel um Platz 3",
    "Final": "Finale"
  };
  return map[stage] || stage || "KO-Runde";
}

function groupLabel(groupName) {
  return String(groupName || "").replace(/^Group\s+/i, "Gruppe ");
}

/* ---------- Team / Flag Handling (JSON-Format) ---------- */

/**
 * buildTeamsMap: baut TEAMS_MAP aus AFCON.teams
 * Ziel: schnelle Zuordnung per Teamname (statt jedes Mal teams[] zu durchsuchen)
 */
function buildTeamsMap() {
  TEAMS_MAP = Object.create(null);
  (AFCON?.teams || []).forEach(t => {
    if (t?.name) TEAMS_MAP[String(t.name)] = t;
  });
}

/**
 * flagFromIso: baut Flag-URL aus iso2 (z.B. "ng" -> .../ng.png)
 * base/ext können in AFCON.flags konfiguriert sein, sonst Default flagcdn.
 */
function flagFromIso(iso2) {
  if (!iso2) return "";
  const base = AFCON?.flags?.base || "https://flagcdn.com/w40/";
  const ext = AFCON?.flags?.ext || ".png";
  return `${base}${String(iso2).toLowerCase()}${ext}`;
}

/**
 * teamDisplayName:
 * - wenn team ein String ist: direkt zurück
 * - wenn Objekt: nimmt name (fixes Team) oder label (TBD Platzhalter)
 */
function teamDisplayName(team) {
  if (!team) return "";
  if (typeof team === "string") return team;
  return team.name || team.label || "";
}

/**
 * teamIsKnownName: prüft ob Team "fix" ist
 * Filtert TBD/Winner/Loser-Labels raus, damit du nur echte Paarungen renderst.
 */
function teamIsKnownName(teamLike) {
  const name = teamDisplayName(teamLike);
  const n = String(name ?? "").trim().toLowerCase();
  if (!n) return false;
  if (n === "tbd" || n === "to be decided") return false;
  if (n.startsWith("winner") || n.startsWith("loser")) return false;
  return true;
}

/* ---------- Date / Time ---------- */

/**
 * parseKickoff: kombiniert date + time in ein Date-Objekt
 * Erwartet z.B. "2024-01-14" + "18:00"
 */
function parseKickoff(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  return isNaN(d.getTime()) ? null : d;
}

/* ---------- User Helpers ---------- */

/**
 * getUid: liefert eine User-ID als String
 * - falls window.ME nicht existiert oder keine ID: "guest"
 * (wird ggf. für LocalStorage Keys oder Debug benötigt)
 */
function getUid() {
  const me = window.ME || {};
  const uid = me.id ?? me.user_id ?? me.userId ?? null;
  return uid != null ? String(uid) : "guest";
}

/* ---------- Name Normalisierung + Aliases (für DB vs JSON) ---------- */

/**
 * normTeamName: normalisiert Namen zum Vergleichen
 * - trim, lowercase, mehrfach-spaces reduzieren, typografische Apostrophe angleichen
 */
function normTeamName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replaceAll("’", "'");
}

/**
 * mapTeamAlias: gleicht unterschiedliche Schreibweisen ab (DB vs JSON)
 * Beispiel: "DR Kongo" -> "dr congo"
 */
function mapTeamAlias(name) {
  const n = normTeamName(name);

  if (n === "dr congo") return "dr congo";
  if (n === "dr kongo") return "dr congo";
  if (n === "demokratische republik kongo") return "dr congo";
  if (n === "rd congo") return "dr congo";

  if (n === "elfenbein küste") return "elfenbeinküste";
  if (n === "elfenbeinkueste") return "elfenbeinküste";

  return n;
}

/* ---------- Generic API helper (falls app.js api() NICHT existiert) ---------- */

/**
 * api: minimaler Fetch-Wrapper für deine PHP-Endpoints unter api/
 * - GET wenn data fehlt, sonst POST JSON
 * - credentials: include (Session-Cookies)
 * - gibt immer JSON zurück (oder Fehlerobjekt)
 */
async function api(path, data) {
  const res = await fetch(`api/${path}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    cache: "no-store",
    body: data ? JSON.stringify(data) : undefined
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Server returned non-JSON:", text);
    return { ok: false, error: "Server returned non-JSON (siehe Console)" };
  }
}

/**
 * apiMe: holt Login-Status (me.php gibt loggedIn/username etc.)
 */
async function apiMe() {
  return api("me.php");
}

/**
 * apiLogout: Session löschen und zurück zur Startseite
 */
async function apiLogout() {
  await fetch("api/logout.php", { credentials: "include" });
  window.ME = null;
  location.href = "index.html";
}

/* ---------- DB APIs ---------- */

/**
 * placeBet: speichert einen Tipp in der DB (place_bet.php)
 * WICHTIG FIX:
 * - match_id darf NICHT Number(matchId) sein, weil IDs wie "QF1" STRING sind
 */
async function placeBet(matchId, predHome, predAway) {
  const data = await api("place_bet.php", {
    match_id: String(matchId),       // ✅ FIX: als STRING senden
    pred_home: Number(predHome),
    pred_away: Number(predAway)
  });

  if (!data?.ok) {
    alert(data?.error || "Fehler beim Speichern");
    return false;
  }
  return true;
}

/**
 * loadMyBets: lädt alle Tipps des aktuellen Users (my_bets.php)
 * Rückgabe: Map { match_id -> betRow }
 */
async function loadMyBets() {
  const data = await api("my_bets.php");
  if (!data?.ok) return {};

  const map = {};
  (data.bets || []).forEach(b => {
    map[String(b.match_id)] = b;
  });
  return map;
}

/* ---------- Load JSON ---------- */

/**
 * loadAfconJson: lädt data/afcon.json ins AFCON-Objekt und baut TEAMS_MAP
 */
async function loadAfconJson() {
  const res = await fetch("data/afcon.json", { cache: "no-store" });
  AFCON = await res.json();
  buildTeamsMap();
}

/* ---------- Fallback: Zeit aus AFCON JSON holen, wenn DB nur DATE hat ---------- */

/**
 * getKoMetaFromJson: sucht für ein Match (id) die (date,time) in AFCON.knockout
 * wird genutzt, wenn DB match_date zwar Datum aber keine Uhrzeit liefert
 */
function getKoMetaFromJson(matchId) {
  const idStr = String(matchId);
  const rounds = AFCON?.knockout || [];
  for (const round of rounds) {
    for (const m of (round.matches || [])) {
      if (String(m.id) === idStr) {
        return { date: m.date || "", time: m.time || "" };
      }
    }
  }
  return null;
}

/* =========================================================
   KO Matches aus DB (für tipps.html)
   - DB liefert home_name / away_name / match_date
   - iso2 wird über AFCON.teams gemappt, daraus wird Flag-URL gebaut
   ========================================================= */

/**
 * loadKoMatchesFromDb:
 * - holt KO Matches aus ko_matches.php
 * - mappt Teamnamen -> iso2 -> Flag-URL
 * - liest Datum/Uhrzeit aus DB; falls Uhrzeit fehlt: Fallback aus JSON
 * - liefert vereinheitlichte Match-Objekte für koBetCardWithState()
 */
async function loadKoMatchesFromDb() {
  const data = await api("ko_matches.php");
  if (!data?.ok) return [];

  const base = AFCON?.flags?.base || "https://flagcdn.com/w40/";
  const ext = AFCON?.flags?.ext || ".png";

  // isoMap: normalisierter Teamname -> iso2
  const isoMap = new Map();
  (AFCON?.teams || []).forEach(t => {
    isoMap.set(normTeamName(t.name), String(t.iso2 || ""));
  });

  return (data.matches || []).map(row => {
    // DB Namen normalisieren + Aliases anwenden
    const homeKey = mapTeamAlias(row.home_name);
    const awayKey = mapTeamAlias(row.away_name);

    // iso2 aus dem JSON-Team-Mapping
    let homeIso2 = isoMap.get(homeKey) || "";
    let awayIso2 = isoMap.get(awayKey) || "";

    // Extra-Fallback für DR Congo (falls JSON/DB abweicht)
    if (!homeIso2 && homeKey === "dr congo") homeIso2 = "cd";
    if (!awayIso2 && awayKey === "dr congo") awayIso2 = "cd";

    // match_date aus DB ist DATETIME (YYYY-MM-DD HH:MM:SS)
    const dt = String(row.match_date || "");
    const dbDate = dt.slice(0, 10);
    const dbTime = dt.length >= 16 ? dt.slice(11, 16) : "";

    let date = dbDate;
    let time = dbTime;

    // Wenn Uhrzeit fehlt oder 00:00: Fallback aus JSON
    if (!time || time === "00:00") {
      const meta = getKoMetaFromJson(row.id);
      if (meta?.time) time = meta.time;
      if (meta?.date) date = meta.date;
    }

    // Vereinheitlichtes Objekt, das tipps.html rendert
    return {
      id: String(row.id),
      stage: "Round of 16",
      date,
      time,
      venue: "",
      home: { name: row.home_name || "?", flag: homeIso2 ? `${base}${homeIso2}${ext}` : "" },
      away: { name: row.away_name || "?", flag: awayIso2 ? `${base}${awayIso2}${ext}` : "" }
    };
  });
}

/* =========================================================
   tipps.html Renderer (DB)
   ========================================================= */

/**
 * koBetCardWithState:
 * - baut eine Tipp-Card als HTML (mit Lock-Status)
 * - zeigt nur Spiele mit fixen Teams (kein TBD/Winner/Loser)
 * - setzt data-kickoff, damit Live-Lock funktionieren kann
 */
function koBetCardWithState(match, myBetsMap) {
  const matchId = match.id;
  if (!matchId) return "";

  const homeName = match.home?.name;
  const awayName = match.away?.name;

  // Nur anzeigen, wenn beide Teams echte Namen sind
  if (!teamIsKnownName(homeName) || !teamIsKnownName(awayName)) return "";

  // Meta-Zeile (Datum • Uhrzeit • Venue)
  const meta = [match.date, match.time, match.venue].filter(Boolean).join(" • ");

  // IDs für Inputs
  const hId = `h_${matchId}`;
  const aId = `a_${matchId}`;

  // Kickoff berechnen und locken, sobald Startzeit erreicht
  const kickoff = parseKickoff(match.date, match.time);
  const kickoffMs = kickoff ? kickoff.getTime() : 0;
  const locked = kickoff ? (Date.now() >= kickoffMs) : false;
  if (locked) return "";

  // Bereits existierender Tipp?
  const existing = myBetsMap[String(matchId)];
  const hasTip = !!existing;

  // CSS-States für Optik (getippt/locked)
  const cardClass =
    "ko-card" +
    (hasTip ? " is-tipped" : "") +
    (locked ? " is-locked" : "");

  const badge = `<span class="lock-badge">${hasTip ? "Getippt" : "Tipp bis Spielbeginn"}</span>`;

  // Vorbelegen der Inputs, wenn Tipp existiert
  const valH = hasTip ? escapeHtml(existing.pred_home) : "";
  const valA = hasTip ? escapeHtml(existing.pred_away) : "";

  // Card HTML
  return `
    <article class="${cardClass}"
             data-stage="${escapeHtml(match.stage || "")}"
             data-match-id="${escapeHtml(matchId)}"
             data-kickoff="${kickoffMs}">
      <div class="ko-head">
        <div class="ko-stage">${escapeHtml(stageLabel(match.stage))} ${badge}</div>
        <div class="ko-meta">${escapeHtml(meta)}</div>
      </div>

      <div class="teams-line">
        <div class="team-inline">
          ${makeFlagHtml(match.home?.flag)}
          <div class="team-name">${escapeHtml(homeName)}</div>
        </div>

        <div class="vs">VS</div>

        <div class="team-inline">
          ${makeFlagHtml(match.away?.flag)}
          <div class="team-name">${escapeHtml(awayName)}</div>
        </div>
      </div>

      <div class="tip-row">
        <input class="score-input" id="${escapeHtml(hId)}" type="number" min="0" max="20"
               value="${valH}" ${locked ? "disabled" : ""}>
        <span class="sep">:</span>
        <input class="score-input" id="${escapeHtml(aId)}" type="number" min="0" max="20"
               value="${valA}" ${locked ? "disabled" : ""}>
      </div>

      <div class="card-actions">
        <div class="small">Match-ID: ${escapeHtml(matchId)}</div>
        <button class="btn" data-save="${escapeHtml(matchId)}" ${locked ? "disabled" : ""}>
          ${hasTip ? "Tipp ändern" : "Tipp speichern"}
        </button>
      </div>
    </article>
  `;
}

/**
 * startLiveLockWatcher:
 * - läuft jede Sekunde
 * - sperrt Cards automatisch, wenn Kickoff erreicht ist
 * - deaktiviert Inputs + Button und aktualisiert Badge-Text
 */
function startLiveLockWatcher() {
  setInterval(() => {
    document.querySelectorAll(".ko-card[data-kickoff]").forEach(card => {
      const kickoffMs = Number(card.getAttribute("data-kickoff") || "0");
      if (!kickoffMs) return;

      if (Date.now() >= kickoffMs && !card.classList.contains("is-locked")) {
        card.remove();
      }
    });
  }, 1000);
}

/**
 * initTippsPage:
 * - prüft Login
 * - lädt Tipps + KO-Matches
 * - rendert Cards
 * - bindet Click-Handler für "Tipp speichern/ändern"
 */
async function initTippsPage() {
  const wrap = getEl("koMatches");
  if (!wrap) return;

  const notice = getEl("authNotice");

  // Login-Status abfragen
  const me = await apiMe();
  const loggedIn = !!(me && (me.loggedIn === true || me.logged_in === true));

  // Wenn nicht eingeloggt: Hinweis anzeigen + keine Cards
  if (!loggedIn) {
    if (notice) {
      notice.style.display = "block";
      notice.innerHTML = `Du musst eingeloggt sein, um Tipps abzugeben. Bitte oben auf <b>Login</b> klicken.`;
    }
    wrap.innerHTML = "";
    return;
  }

  // Userdaten global speichern
  window.ME = me;
  state.user = me;
  saveState();

  // optional: Storage von anderen Usern bereinigen (wenn du diese Funktion hast)
  if (typeof window.cleanupOtherUsersLocalStorage === "function") {
    window.cleanupOtherUsersLocalStorage();
  }

  // Notice ausblenden
  if (notice) {
    notice.style.display = "none";
    notice.textContent = "";
  }

  // Meine Tipps + KO-Spiele laden
  const myBetsMap = await loadMyBets();
  const matches = await loadKoMatchesFromDb();

  // Cards bauen + anzeigen
  const htmlCards = matches.map(m => koBetCardWithState(m, myBetsMap)).filter(Boolean);
  wrap.innerHTML = htmlCards.join("") || `<div class="notice">Keine KO-Spiele in der Datenbank gefunden.</div>`;

  // Live Lock aktivieren
  startLiveLockWatcher();

  // Save-Buttons verdrahten
  wrap.querySelectorAll("button[data-save]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const matchId = btn.getAttribute("data-save");
      const hInput = document.getElementById(`h_${matchId}`);
      const aInput = document.getElementById(`a_${matchId}`);

      // Werte holen
      const ph = hInput?.value ?? "";
      const pa = aInput?.value ?? "";

      // Validierung: beide Felder müssen gefüllt sein
      if (ph === "" || pa === "") {
        alert("Bitte beide Tore eingeben.");
        return;
      }

      // Button während Save deaktivieren
      btn.disabled = true;
      const ok = await placeBet(matchId, ph, pa);
      btn.disabled = false;
      if (!ok) return;

      // Lokale Map updaten, damit UI "getippt" bleibt
      // ✅ FIX: match_id bleibt STRING, keine Number(matchId)
      myBetsMap[String(matchId)] = { match_id: String(matchId), pred_home: Number(ph), pred_away: Number(pa) };

      state.myBets = myBetsMap;
      state.lastSavedBet = matchId;
      saveState();

      // Card-State setzen
      const card = btn.closest(".ko-card");
      if (card) card.classList.add("is-tipped");
      card?.querySelector(".lock-badge")?.replaceChildren(document.createTextNode("Getippt"));

      // Kurzes Feedback am Button
      btn.textContent = "Gespeichert";
      setTimeout(() => (btn.textContent = "Tipp ändern"), 1200);
    });
  });
}

/* =========================================================
   afcon.html Ansicht (JSON)
   - Gruppen: Flagge wird über TEAMS_MAP ermittelt
   - KO: home/away sind Objekte (name/iso2 oder label)
   ========================================================= */

/**
 * renderGroups:
 * - rendert jede Gruppe als Card + Tabelle
 * - pro Team wird die Flagge über TEAMS_MAP (oder iso2-Fallback) geholt
 */
function renderGroups() {
  const container = getEl("groupsContainer", "groups");
  if (!container) return;

  if (!Array.isArray(AFCON?.groups)) {
    container.innerHTML = `<div class="notice">Keine Gruppen-Daten.</div>`;
    return;
  }

  const html = AFCON.groups.map(g => {
    const rows = (g.table || []).map(r => {
      const t = TEAMS_MAP[r.team];
      const flagUrl = t?.flag || flagFromIso(t?.iso2);
      return `
        <tr>
          <td class="teamcell">${makeFlagHtml(flagUrl)} <span>${escapeHtml(r.team)}</span></td>
          <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
          <td>${r.gf}</td><td>${r.ga}</td><td>${r.gd}</td><td><strong>${r.pts}</strong></td>
        </tr>
      `;
    }).join("");

    return `
      <section class="group-card">
        <h3>${escapeHtml(groupLabel(g.name))}</h3>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }).join("");

  container.innerHTML = html;
}

/**
 * renderKnockoutList:
 * - rendert KO-Spiele als Card-Grid
 * - zeigt nur Spiele, bei denen home+away fix sind (keine TBD/Winner/Loser)
 * - Flaggen: aus iso2 (oder TEAMS_MAP wenn vorhanden)
 */
function renderKnockoutList() {
  const container = getEl("koContainer", "knockoutContainer", "koRounds");
  if (!container) return;

  if (!Array.isArray(AFCON?.knockout)) {
    container.innerHTML = `<div class="notice">Keine KO-Daten.</div>`;
    return;
  }

  const cards = [];

  AFCON.knockout.forEach(roundObj => {
    const roundName = roundObj.round || "KO";

    (roundObj.matches || []).forEach(m => {
      const home = m.home;
      const away = m.away;

      // nur wenn beide Teams fix sind
      if (!teamIsKnownName(home) || !teamIsKnownName(away)) return;

      // Teamnamen anzeigen
      const homeName = teamDisplayName(home);
      const awayName = teamDisplayName(away);

      // Flaggen ermitteln (iso2 bevorzugt)
      const hf = home?.iso2 ? (TEAMS_MAP[homeName]?.flag || flagFromIso(home.iso2)) : "";
      const af = away?.iso2 ? (TEAMS_MAP[awayName]?.flag || flagFromIso(away.iso2)) : "";

      // Meta (Datum • Zeit)
      const meta = [m.date, m.time].filter(Boolean).join(" • ");

      // Venue zusammensetzen
      const stadium = m.venue?.stadium || "";
      const city = m.venue?.city || "";
      const venue = `${stadium}${city ? " - " + city : ""}`.trim();
      const score = m.score && m.score.home != null && m.score.away != null
        ? `${m.score.home} : ${m.score.away}`
        : "";
      const note = m.note || "";

      // KO-Card pushen
      cards.push(`
        <article class="ko-card-view">
          <div class="ko-topline">
            <div class="ko-round-title">${escapeHtml(stageLabel(roundName))}</div>
            <div class="ko-meta-small">${escapeHtml(meta)}</div>
          </div>

          <div class="ko-teams-line">
            <div class="ko-team-box">
              ${makeFlagHtml(hf)}
              <div class="ko-team-name">${escapeHtml(homeName)}</div>
            </div>

            <div class="ko-vs-pill">vs</div>

            <div class="ko-team-box">
              ${makeFlagHtml(af)}
              <div class="ko-team-name">${escapeHtml(awayName)}</div>
            </div>
          </div>

          ${score ? `<div class="ko-score">${escapeHtml(score)}</div>` : ""}
          <div class="ko-venue">${escapeHtml(venue)}</div>
          ${note ? `<div class="ko-note">${escapeHtml(note)}</div>` : ""}
        </article>
      `);
    });
  });

  // Ausgabe: Grid oder Hinweis, wenn keine fixen KO-Spiele vorhanden sind
  container.innerHTML = cards.length
    ? `<div class="ko-grid">${cards.join("")}</div>`
    : `<div class="notice">Keine KO-Spiele mit fixen Teams vorhanden.</div>`;
}

/**
 * renderTopScorers:
 * - rendert Tabelle der Top-Torjäger
 * - sortiert absteigend nach goals
 * - Flagge aus TEAMS_MAP oder teamIso2 Fallback
 */
function renderTopScorers() {
  const container = getEl("scorersContainer", "topScorers");
  if (!container) return;

  if (!Array.isArray(AFCON?.topScorers)) {
    container.innerHTML = `<div class="notice">Keine Torjäger-Daten.</div>`;
    return;
  }

  const rows = AFCON.topScorers
    .slice()
    .sort((a, b) => (b.goals || 0) - (a.goals || 0))
    .slice(0, 5)
    .map((s, i) => {
      const teamObj = TEAMS_MAP[s.team];
      const flag = teamObj?.flag || (s.teamIso2 ? flagFromIso(s.teamIso2) : "");
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(s.player)}</td>
          <td class="teamcell">${makeFlagHtml(flag)} <span>${escapeHtml(s.team)}</span></td>
          <td><strong>${s.goals}</strong></td>
        </tr>
      `;
    }).join("");

  container.innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr><th>#</th><th>Spieler</th><th>Team</th><th>Tore</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <p class="muted" style="margin-top:10px;">Kurzliste der besten Torjäger. Golden Boot: Brahim Díaz (5 Tore).</p>
  `;
}

/**
 * initAfconViewPage:
 * - startet Rendering für afcon.html (Gruppen, KO, Torjäger)
 */
function initAfconViewPage() {
  renderGroups();
  renderKnockoutList();
  renderTopScorers();
}

/* ---------- Global init ---------- */

/**
 * DOMContentLoaded:
 * - Logout-Button (falls vorhanden) verdrahten
 * - AFCON JSON laden (AFCON + TEAMS_MAP)
 * - wenn tipps.html erkannt (Element #koMatches existiert): initTippsPage()
 * - sonst: afcon.html View rendern
 */
document.addEventListener("DOMContentLoaded", async () => {
  loadState();
  const logoutBtn = getEl("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      apiLogout();
    });
  }

  // JSON laden (wird in beiden Seiten benötigt)
  await loadAfconJson();

  // tipps.html Erkennung: KO-Matches Container vorhanden?
  if (getEl("koMatches")) {
    initTippsPage();
    return;
  }

  // sonst: afcon.html View
  initAfconViewPage();
});
