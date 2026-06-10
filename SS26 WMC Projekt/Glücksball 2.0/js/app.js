console.log("app.js geladen OK"); // Debug: zeigt in der Console, dass app.js wirklich geladen wurde

/* =========================================================
   THEME (Light / Dark)
   ========================================================= */

/**
 * applyTheme(theme)
 * - setzt data-theme am <html> Element (für CSS Variablen / Theme-Switch)
 * - speichert das Theme in localStorage, damit es beim Reload bleibt
 * - passt den Button-Text so an, dass er den Modus zeigt, zu dem gewechselt wird
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  // Button zeigt den Zielmodus:
  // im Darkmode -> Lightmode, im Lightmode -> Darkmode.
  const nextThemeLabel = theme === "dark" ? "Lightmode" : "Darkmode";
  btn.textContent = nextThemeLabel;
  btn.title = theme === "dark" ? "Zum Lightmode wechseln" : "Zum Darkmode wechseln";
  btn.setAttribute("aria-label", btn.title);
}

/**
 * setupTheme()
 * - liest gespeichertes Theme aus localStorage
 * - setzt Default auf "dark"
 * - registriert Click-Handler für den Theme-Button
 */
function setupTheme() {
  const saved = localStorage.getItem("theme");
  applyTheme(saved || "dark");

  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * escapeHtml(s)
 * - schützt gegen HTML-Injection, wenn Daten in innerHTML landen
 * - ersetzt Sonderzeichen durch HTML-Entities
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
 * formatDate(dateStr)
 * - formatiert ein Datum (ISO/String) als deutsches Datum
 * - falls etwas schiefgeht: gibt Original zurück
 */
function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString("de-DE");
  } catch {
    return dateStr || "";
  }
}

/* =========================================================
   API HELPER
   ========================================================= */

/**
 * api(path, data)
 * - Wrapper für Fetch zu deinen PHP Endpoints (api/*.php)
 * - GET wenn kein data übergeben wird, sonst POST mit JSON body
 * - credentials: include, damit PHP-Session-Cookie mitgeschickt wird
 * - wirft Error bei HTTP-Fehlern (res.ok == false)
 */
async function api(path, data) {
  const res = await fetch(`api/${path}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include"
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Fehler");
  return json;
}

/* =========================================================
   AUTH (API Session) + LED + Login/Logout Button
   - Name statt "Gast"
   - LED grün wenn eingeloggt
   - Button: Login öffnet Box / Logout loggt aus
   ========================================================= */

/**
 * authState
 * - zentraler Zustand für Loginstatus im Frontend
 */
const authState = { loggedIn: false, username: null };
const protectedPages = new Set(["tipps.html", "spasstipp.html", "ranking.html", "forum.html"]);

function currentPageName() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  return page.toLowerCase();
}

function enforceProtectedPage() {
  const page = currentPageName();
  if (!protectedPages.has(page) || authState.loggedIn) return;

  sessionStorage.setItem("gb_login_required", "Bitte zuerst einloggen.");
  window.location.href = "index.html";
}

function setupProtectedNavLinks() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    const hrefPage = (link.getAttribute("href") || "").split("#")[0].split("?")[0].toLowerCase();
    if (!protectedPages.has(hrefPage) || authState.loggedIn) return;

    event.preventDefault();
    sessionStorage.setItem("gb_login_required", "Bitte zuerst einloggen.");
    window.location.href = "index.html";
  });
}

function showLoginRequiredNotice() {
  const message = sessionStorage.getItem("gb_login_required");
  if (!message) return;
  sessionStorage.removeItem("gb_login_required");
  alert(message);
}

/**
 * setAuthStatus(loggedIn, username)
 * - setzt authState
 * - aktualisiert LED, Username in Nav, Button-Text (Login/Logout)
 * - schließt Login-Box beim Einloggen
 * - blendet optional authUser Bereich aus (wenn vorhanden)
 */
function setAuthStatus(loggedIn, username) {
  authState.loggedIn = !!loggedIn;
  authState.username = username || null;

  const led = document.getElementById("loginLed");
  const nameSpan = document.getElementById("navUsername");
  const btn = document.getElementById("authToggle");
  const authBox = document.getElementById("authBox");

  // LED: grün bei login, rot bei logout
  if (led) led.classList.toggle("is-on", authState.loggedIn);

  // Name nur anzeigen wenn eingeloggt
  if (nameSpan) nameSpan.textContent = authState.loggedIn ? authState.username : "";

  // Button: Login/Logout
  if (btn) btn.textContent = authState.loggedIn ? "Logout" : "Login";

  // wenn eingeloggt: Login-Box sicher zu
  if (authBox && authState.loggedIn) authBox.style.display = "none";

  // optional: falls du authUser Bereich im HTML hast -> ausblenden (wir nutzen nur 1 Button)
  const authUser = document.getElementById("authUser");
  if (authUser) authUser.style.display = "none";
}

/**
 * toggleAuthBox(forceClose)
 * - toggelt das Dropdown (Login Box)
 * - forceClose=true: erzwingt "zu"
 */
function toggleAuthBox(forceClose = false) {
  const box = document.getElementById("authBox");
  if (!box) return;
  box.style.display = forceClose ? "none" : (box.style.display === "block" ? "none" : "block");
}

/**
 * setupAuthToggle()
 * - Klick auf Login/Logout Button:
 *   - wenn eingeloggt: logout.php aufrufen und Seite reloaden
 *   - wenn ausgeloggt: Login Box öffnen/schließen
 * - Klick außerhalb der Auth-Area schließt die Box
 */
function setupAuthToggle() {
  const btn = document.getElementById("authToggle");
  const area = document.getElementById("authArea");
  if (!btn || !area) return;

  btn.addEventListener("click", async (e) => {
    e.stopPropagation();

    // OK Wenn eingeloggt: Logout
    if (authState.loggedIn) {
      try {
        await api("logout.php", {});
      } catch (_) { }
      setAuthStatus(false, null);
      location.reload();
      return;
    }

    // Nein Wenn ausgeloggt: Login-Box togglen
    toggleAuthBox(false);
  });

  // Klick außerhalb schließt Box
  document.addEventListener("click", (e) => {
    if (!area.contains(e.target)) toggleAuthBox(true);
  });
}

/**
 * updateNav()
 * - fragt me.php ab (Session-Check)
 * - wenn username vorhanden: UI auf "eingeloggt" setzen
 * - sonst: UI auf "ausgeloggt" setzen
 */
async function updateNav() {
  try {
    const me = await api("me.php");

    // OK Session vorhanden
    if (me && me.username) {
      setAuthStatus(true, me.username);
      toggleAuthBox(true);
      return;
    }
  } catch (e) {
    console.warn("Nicht eingeloggt");
  }

  // Nein wirklich ausgeloggt
  setAuthStatus(false, "");
}

/* =========================================================
   LOGIN FORM (Navbar) - via api/login.php
   ========================================================= */

/**
 * setupLoginFormNavbar()
 * - sendet username/password an login.php
 * - bei Erfolg: Nav updaten, Box schließen, Seite reloaden
 */
function setupLoginFormNavbar() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginName")?.value.trim();
    const password = document.getElementById("loginPass")?.value;

    try {
      await api("login.php", { username, password });
      await updateNav();
      toggleAuthBox(true);
      location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
}

function setupForgotPasswordForm() {
  const toggle = document.getElementById("forgotToggle");
  const form = document.getElementById("forgotForm");
  if (!toggle || !form) return;

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    form.style.display = form.style.display === "grid" ? "none" : "grid";
  });

  form.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("forgotName")?.value.trim();
    const email = document.getElementById("forgotEmail")?.value.trim();
    try {
      const result = await api("forgot_password.php", { username, email });
      let message = result.message || "Reset-Link wurde verschickt.";
      if (result.reset_link) {
        message += `\n\nLokaler Test-Link:\n${result.reset_link}`;
      }
      alert(message);
      form.reset();
      form.style.display = "none";
    } catch (err) {
      alert(err.message);
    }
  });
}

/* =========================================================
   REGISTER FORM - via api/register.php
   ========================================================= */

/**
 * setupRegisterForm()
 * - sendet username/email/password an register.php
 * - bei Erfolg: Alert + Form reset
 */
function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("regName")?.value.trim();
    const email = document.getElementById("regEmail")?.value.trim();
    const password = document.getElementById("regPass")?.value;

    try {
      const result = await api("register.php", { username, email, password });
      alert(result.message || "Registrierung gespeichert. Dein Konto muss noch freigegeben werden.");
      form.reset();
    } catch (err) {
      alert(err.message);
    }
  });
}

/* =========================================================
   WETTEN SEITE SCHUTZ
   ========================================================= */

/**
 * protectBetsPage()
 * - blendet Content nur ein, wenn User eingeloggt ist
 * - erwartet HTML Elemente:
 *   - #locked (Hinweis "bitte einloggen")
 *   - #content (eigentliche Seite)
 * - Rückgabe: true wenn sichtbar, sonst false
 */
async function protectBetsPage() {
  const locked = document.getElementById("locked");
  const content = document.getElementById("content");
  if (!locked || !content) return false;

  try {
    const me = await api("me.php");
    if (me.loggedIn) {
      locked.style.display = "none";
      content.style.display = "block";
      return true;
    }
  } catch (_) { }

  locked.style.display = "block";
  content.style.display = "none";
  return false;
}

/* =========================================================
   KOMMENDE SPIELE (Startseite) - als Karten: Flagge Land VS Flagge Land
   ========================================================= */

/**
 * flags
 * - Map: Teamname -> ISO2 Code (für flagcdn)
 * - enthält Aliases (DR Kongo / Kongo DR / Demokratische Republik Kongo)
 */
const flags = {
  "Afghanistan": "af",
  "Algeria": "dz",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Ägypten": "eg",
  "Argentinien": "ar",
  "Belgien": "be",
  "Brasilien": "br",
  "Chile": "cl",
  "Dänemark": "dk",
  "Deutschland": "de",
  "England": "gb-eng",
  "Frankreich": "fr",
  "Griechenland": "gr",
  "Honduras": "hn",
  "Italien": "it",
  "Kroatien": "hr",
  "Luxemburg": "lu",
  "Neuseeland": "nz",
  "Niederlande": "nl",
  "Nordirland": "gb-nir",
  "Nordmazedonien": "mk",
  "Norwegen": "no",
  "Polen": "pl",
  "Portugal": "pt",
  "Schottland": "gb-sct",
  "Schweden": "se",
  "Spanien": "es",
  "Türkei": "tr",
  "Ukraine": "ua",
  "USA": "us",
  "Wales": "gb-wls",
  "Belgium": "be",
  "Bolivia": "bo",
  "Bosnia and Herzegovina": "ba",
  "Brazil": "br",
  "Canada": "ca",
  "Cape Verde": "cv",
  "Colombia": "co",
  "Costa Rica": "cr",
  "Croatia": "hr",
  "Curacao": "cw",
  "Czech Republic": "cz",
  "DR Congo": "cd",
  "Ecuador": "ec",
  "Egypt": "eg",
  "England": "gb-eng",
  "France": "fr",
  "Germany": "de",
  "Ghana": "gh",
  "Haiti": "ht",
  "Iran": "ir",
  "Iraq": "iq",
  "Ivory Coast": "ci",
  "Japan": "jp",
  "Jordan": "jo",
  "Mexico": "mx",
  "Morocco": "ma",
  "Netherlands": "nl",
  "New Zealand": "nz",
  "Norway": "no",
  "Panama": "pa",
  "Pakistan": "pk",
  "Paraguay": "py",
  "Portugal": "pt",
  "Qatar": "qa",
  "Saudi Arabia": "sa",
  "Scotland": "gb-sct",
  "Senegal": "sn",
  "South Africa": "za",
  "South Korea": "kr",
  "Spain": "es",
  "Sweden": "se",
  "Switzerland": "ch",
  "Tunisia": "tn",
  "Turkey": "tr",
  "United States": "us",
  "Uruguay": "uy",
  "Uzbekistan": "uz",
  "Senegal": "sn",
  "Kamerun": "cm",
  "Elfenbeinküste": "ci",
  "Guinea": "gn",
  "Tunesien": "tn",
  "Mali": "ml",
  "Ghana": "gh",
  "Algerien": "dz",
  "Nigeria": "ng",
  "Marokko": "ma",
  "Ägypten": "eg",
  "Saudi-Arabien": "sa",
  "Katar": "qa",
  "Irak": "iq",
  "Sudan": "sd",
  "Tansania": "tz",
  "Südafrika": "za",
  "Benin": "bj",
  "Mosambik": "mz",
  "Burkina Faso": "bf",
  "DR Kongo": "cd",
  "Kongo DR": "cd",
  "Demokratische Republik Kongo": "cd",
  "Österreich": "at",
  "Oesterreich": "at",
  "Austria": "at",
};

/**
 * matches
 * - statische Liste "kommende Spiele" (Demo/Widget)
 * - wird gefiltert auf zukünftige Spiele und auf die nächsten 5 begrenzt
 */
const matches = [
  { team1: "Senegal", team2: "Sudan", date: "2026-01-03", time: "18:00", tournament: "AFCON" },
  { team1: "Tunesien", team2: "Mali", date: "2026-01-03", time: "21:00", tournament: "AFCON" },
  { team1: "Marokko", team2: "Tansania", date: "2026-01-04", time: "18:00", tournament: "AFCON" },
  { team1: "Südafrika", team2: "Kamerun", date: "2026-01-04", time: "21:00", tournament: "AFCON" },
  { team1: "Ägypten", team2: "Benin", date: "2026-01-05", time: "17:00", tournament: "AFCON" },
  { team1: "Nigeria", team2: "Mosambik", date: "2026-01-05", time: "20:00", tournament: "AFCON" },
  { team1: "Algerien", team2: "DR Kongo", date: "2026-01-06", time: "17:00", tournament: "AFCON" },
  { team1: "Elfenbeinküste", team2: "Burkina Faso", date: "2026-01-06", time: "20:00", tournament: "AFCON" },
  { team1: "Mali", team2: "Senegal", date: "2026-01-09", time: "17:00", tournament: "AFCON" },
  { team1: "Kamerun", team2: "Marokko", date: "2026-01-09", time: "20:00", tournament: "AFCON" },
  { team1: "Algerien", team2: "Nigeria", date: "2026-01-10", time: "17:00", tournament: "AFCON" },
  { team1: "Ägypten", team2: "Elfenbeinküste", date: "2026-01-10", time: "20:00", tournament: "AFCON" },

];

/**
 * normalizeTeamName
 * - normalisiert Teamnamen für den Lookup in flags{}
 */
function normalizeTeamName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .replaceAll("'", "'"); // falls typografische Apostrophe vorkommen
}

/**
 * getFlagUrl
 * - erstellt eine Flag-URL über flagcdn (w20)
 * - wenn Team nicht bekannt: placeholder Bild
 */
function getFlagUrl(teamName) {
  const key = normalizeTeamName(teamName);
  const code = flags[key];
  return code ? `https://flagcdn.com/w20/${code}.png` : "image/flag-placeholder.png";
}

/**
 * renderNextMatches
 * - rendert die nächsten 4 zukünftigen Spiele in #upcomingMatches
 * - Layout: Flagge + Name VS Flagge + Name + Datum/Uhrzeit + Badge Turnier
 */
async function loadNationalMatchesForHome() {
  const res = await fetch("api/upcoming_matches.php", { cache: "no-store" });
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || "Kommende Spiele konnten nicht geladen werden.");

  return (data.matches || []).map(m => {
    const [date, timeWithSeconds = "00:00:00"] = String(m.date || "").split(" ");
    return {
      team1: m.team_home,
      team2: m.team_away,
      date,
      time: timeWithSeconds.slice(0, 5),
      tournament: m.competition || "Nationalspiel",
      venue: m.venue || ""
    };
  });
}

async function renderNextMatches() {
  const container = document.getElementById("upcomingMatches");
  if (!container) return;

  container.innerHTML = `<div class="notice">Lade kommende Nationalspiele...</div>`;

  let allMatches = [];
  try {
    allMatches = await loadNationalMatchesForHome();
  } catch (e) {
    console.error("Kommende Spiele Fehler:", e);
    container.innerHTML = `<div class="notice">Kommende Spiele konnten nicht geladen werden.</div>`;
    return;
  }

  const now = new Date();

  // DateTime bauen, filtern, sortieren, begrenzen
  const upcoming = allMatches
    .map(m => ({ ...m, dateTime: new Date(`${m.date}T${m.time}`) }))
    .filter(m => m.dateTime >= now)
    .sort((a, b) => a.dateTime - b.dateTime)
    .slice(0, 4);

  if (upcoming.length === 0) {
    container.innerHTML = `<div class="notice">Keine kommenden Spiele gefunden.</div>`;
    return;
  }

  // HTML Cards
  container.innerHTML = upcoming.map(m => `
    <article class="mini-card">
      <div class="match-row">
        <div class="team left">
          <img class="flag" src="${getFlagUrl(m.team1)}" alt="${escapeHtml(m.team1)}" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">
          <span class="team-name">${escapeHtml(m.team1)}</span>
        </div>

        <div class="match-center">
          <div class="match-date">${escapeHtml(formatDate(m.date))} • ${escapeHtml(m.time)}</div>
          <div class="vs">VS</div>
          <div class="badge">${escapeHtml(m.tournament)}</div>
        </div>

        <div class="team right">
          <img class="flag" src="${getFlagUrl(m.team2)}" alt="${escapeHtml(m.team2)}" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">
          <span class="team-name">${escapeHtml(m.team2)}</span>
        </div>
      </div>

      ${m.venue && !/^tbd$/i.test(String(m.venue).trim()) ? `<div class="small">${escapeHtml(m.venue)}</div>` : ""}
    </article>
  `).join("");
}

/* =========================================================
   NEWS (ECHT via api/news.php) - 4 NEWS, DE, DUPLIKATE WEG
   ========================================================= */

/**
 * dedupeNews(items)
 * - entfernt Duplikate anhand von:
 *   - link (exakt)
 *   - title (normalisiert, entfernt " - Quelle")
 */
function dedupeNews(items) {
  const seenLinks = new Set();
  const seenTitles = new Set();
  const unique = [];

  for (const it of items) {
    const linkKey = (it.link || "").trim();
    const titleKey = (it.title || "")
      .replace(/\s-\s.+$/, "")
      .trim()
      .toLowerCase();

    if (linkKey && seenLinks.has(linkKey)) continue;
    if (titleKey && seenTitles.has(titleKey)) continue;

    if (linkKey) seenLinks.add(linkKey);
    if (titleKey) seenTitles.add(titleKey);

    unique.push(it);
  }
  return unique;
}

/**
 * filterFootballTournamentNews(items)
 * - filtert News auf Nationalteam-Turnier-Begriffe
 * - wenn später zu wenig übrig bleibt, wird im Loader wieder auf alle zurückgefallen
 */
function filterFootballTournamentNews(items) {
  const footballKeywords = [
    "fußball", "fussball", "soccer", "football", "fifa", "uefa", "caf",
    "afcon", "afrika-cup", "africa cup",
    "copa américa", "copa america",
    "wm-qualifikation", "fußball-wm", "fussball-wm",
    "europameisterschaft", "nations league", "gold cup", "asian cup"
  ];

  const blockedKeywords = [
    "eishockey", "hockey", "handball", "basketball", "volleyball",
    "tennis", "ski", "formel", "motorsport"
  ];

  return items.filter(it => {
    const t = (it.title || "").toLowerCase();
    return footballKeywords.some(k => t.includes(k)) &&
      !blockedKeywords.some(k => t.includes(k));
  });
}

/**
 * renderNews(container, items)
 * - rendert bis zu 5 News in ein Container-Element
 * - jede News zeigt: Titel, Quelle+Datum, Link
 */
function renderNews(container, items) {
  container.innerHTML = "";

  items.slice(0, 4).forEach(item => {
    const d = item.date ? new Date(item.date).toLocaleDateString("de-DE") : "";
    container.innerHTML += `
      <article class="news-item">
        <h3>${escapeHtml(item.title)}</h3>
        <small class="meta">${escapeHtml(item.source || "News")}${d ? " • " + d : ""}</small>
        ${item.summary ? `<p class="news-summary">${escapeHtml(item.summary)}</p>` : ""}
        <p style="margin-top:.5rem;">
          <a class="news-link" href="${item.link}" target="_blank" rel="noopener">Artikel öffnen</a>
        </p>
      </article>
    `;
  });
}

/**
 * loadNationalNews()
 * - lädt api/news.php (Google News RSS Aggregation)
 * - filtert auf Turnier-News, deduped und rendert 5 Stück
 * - zeigt Fallback-Text bei Fehler
 */
async function loadNationalNews() {
  const box = document.getElementById("nationalNews");
  if (!box) return;

  box.innerHTML = `<p style="color:var(--muted);">Lade Nachrichten…</p>`;

  try {
    const res = await fetch("api/news.php", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);

    const data = await res.json();
    if (!data.ok || !Array.isArray(data.items) || data.items.length === 0) {
      throw new Error("Keine items");
    }

    // Nur Fußball-News. Kein Fallback auf andere Sportarten.
    let items = filterFootballTournamentNews(data.items);
    if (items.length === 0) throw new Error("Keine Fußball-News");

    // Duplikate raus und anzeigen
    items = dedupeNews(items);
    renderNews(box, items);
  } catch (e) {
    console.error("News Fehler:", e);
    box.innerHTML = `<p style="color:var(--muted);">News konnten nicht geladen werden.</p>`;
  }
}

/* =========================================================
   RANKING
   ========================================================= */

/**
 * loadRanking()
 * - lädt api/ranking.php
 * - akzeptiert:
 *   - Array direkt ODER
 *   - Objekt mit ranking/users Feld
 * - rendert Zeilen in #rankingTable tbody
 */
async function loadRanking() {
  const tbody = document.querySelector("#rankingTable tbody");
  if (!tbody) return;

  try {
    const res = await fetch("api/ranking.php", { cache: "no-store" });
    const data = await res.json();

    // Falls ranking.php im Fehlerfall {ok:false,...} liefert
    if (data && data.ok === false) throw new Error(data.error || "Ranking API Fehler");

    // unterstützt mehrere Rückgabe-Formate
    const rows = Array.isArray(data) ? data : (data.ranking || data.users || []);

    tbody.innerHTML = "";
    rows.forEach((u, i) => {
      const name = u.display_name ?? u.username ?? ("User#" + (u.user_id ?? i + 1));
      const hits = Number(u.hits ?? 0);
      const finished = Number(u.finished_tips ?? 0);
      const hitRate = finished > 0 ? Math.round((hits / finished) * 100) : 0;
      tbody.innerHTML += `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(name)}</td>
          <td><strong>${escapeHtml(u.points ?? 0)}</strong></td>
          <td>${escapeHtml(u.tips ?? u.tipps ?? 0)}</td>
          <td><strong>${escapeHtml(`${hits}/${finished}`)}</strong> (${escapeHtml(`${hitRate}%`)})</td>
        </tr>
      `;
    });

    // leere Tabelle -> Hinweis
    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">Keine Nutzer gefunden.</td></tr>`;
    }
  } catch (e) {
    console.error("Ranking Fehler:", e);
    tbody.innerHTML = `<tr><td colspan="5">Ranking konnte nicht geladen werden.</td></tr>`;
  }
}

/* =========================================================
   START / INIT
   ========================================================= */

// Theme initial setzen + Toggle aktivieren
setupTheme();

// Auth UI + Events aufsetzen
setupAuthToggle();
setupLoginFormNavbar();
setupForgotPasswordForm();
setupRegisterForm();

// Nav-Status vom Server holen (eingeloggt oder nicht)
updateNav().then(enforceProtectedPage);
setupProtectedNavLinks();
showLoginRequiredNotice();

// Seiten mit #locked/#content werden erst nach Login sichtbar.
protectBetsPage();

// Seite-spezifische Widgets beim DOM Ready starten
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("upcomingMatches")) renderNextMatches();
  if (document.getElementById("nationalNews")) loadNationalNews();
  if (document.getElementById("rankingTable")) loadRanking();
});

// OK Klick auf LED + Username -> Statistik (nur wenn eingeloggt)
document.addEventListener("DOMContentLoaded", () => {
  const authStatus = document.getElementById("authStatus");
  if (!authStatus) return;

  authStatus.addEventListener("click", async () => {
    try {
      const me = await api("me.php");

      // nur wenn wirklich eingeloggt
      if (me && (me.loggedIn === true || me.logged_in === true)) {
        window.location.href = "statistik.html";
      }
    } catch (e) {
      console.warn("Nicht eingeloggt -> keine Statistik");
    }
  });
});


