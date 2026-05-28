console.log("statistik.js geladen");

const STAT_FLAGS = {
  "Ägypten": "eg",
  "Algerien": "dz",
  "Argentina": "ar",
  "Argentinien": "ar",
  "Australia": "au",
  "Australien": "au",
  "Austria": "at",
  "Belgien": "be",
  "Belgium": "be",
  "Bosnia and Herzegovina": "ba",
  "Bosnien und Herzegowina": "ba",
  "Brazil": "br",
  "Brasilien": "br",
  "Canada": "ca",
  "Cape Verde": "cv",
  "Chile": "cl",
  "Colombia": "co",
  "Croatia": "hr",
  "Czech Republic": "cz",
  "Dänemark": "dk",
  "Deutschland": "de",
  "DR Congo": "cd",
  "Ecuador": "ec",
  "Egypt": "eg",
  "England": "gb-eng",
  "France": "fr",
  "Frankreich": "fr",
  "Germany": "de",
  "Ghana": "gh",
  "Griechenland": "gr",
  "Haiti": "ht",
  "Honduras": "hn",
  "Iran": "ir",
  "Iraq": "iq",
  "Irak": "iq",
  "Italien": "it",
  "Japan": "jp",
  "Jordan": "jo",
  "Kroatien": "hr",
  "Luxemburg": "lu",
  "Mexico": "mx",
  "Morocco": "ma",
  "Marokko": "ma",
  "Netherlands": "nl",
  "Neuseeland": "nz",
  "New Zealand": "nz",
  "Niederlande": "nl",
  "Nigeria": "ng",
  "Nordirland": "gb-nir",
  "Nordmazedonien": "mk",
  "Norway": "no",
  "Norwegen": "no",
  "Österreich": "at",
  "Oesterreich": "at",
  "Panama": "pa",
  "Paraguay": "py",
  "Polen": "pl",
  "Portugal": "pt",
  "Qatar": "qa",
  "Saudi Arabia": "sa",
  "Scotland": "gb-sct",
  "Schottland": "gb-sct",
  "Schweden": "se",
  "Senegal": "sn",
  "South Africa": "za",
  "South Korea": "kr",
  "Spain": "es",
  "Spanien": "es",
  "Sweden": "se",
  "Switzerland": "ch",
  "Tunisia": "tn",
  "Tunesien": "tn",
  "Turkey": "tr",
  "Türkei": "tr",
  "Ukraine": "ua",
  "United States": "us",
  "Uruguay": "uy",
  "USA": "us",
  "Uzbekistan": "uz",
  "Wales": "gb-wls"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fmtDate(value) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("de-DE");
}

function flagUrl(teamName) {
  const code = STAT_FLAGS[String(teamName || "").trim()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "image/flag-placeholder.png";
}

function teamHtml(teamName, flagSide = "left") {
  const safeName = escapeHtml(teamName || "-");
  const flag = `<img class="flag" src="${escapeHtml(flagUrl(teamName))}" alt="${safeName}" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">`;
  const name = `<span>${safeName}</span>`;
  return `<span class="stat-team">${flagSide === "right" ? name + flag : flag + name}</span>`;
}

function matchHtml(home, away) {
  return `
    <span class="stat-match">
      ${teamHtml(home, "left")}
      <span class="muted">vs</span>
      ${teamHtml(away, "right")}
    </span>
  `;
}

async function api2(path, data) {
  const res = await fetch(`api/${path}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    credentials: "include",
    cache: "no-store",
    body: data ? JSON.stringify(data) : undefined
  });

  const text = await res.text();
  const json = JSON.parse(text);
  if (!res.ok || json.ok === false) throw new Error(json.error || "Fehler");
  return json;
}

function showLocked(message) {
  const locked = document.getElementById("locked");
  const content = document.getElementById("content");
  if (locked) {
    locked.style.display = "block";
    locked.textContent = message || "Du musst eingeloggt sein, um deine Statistik zu sehen.";
  }
  if (content) content.style.display = "none";
}

function showContent() {
  const locked = document.getElementById("locked");
  const content = document.getElementById("content");
  if (locked) locked.style.display = "none";
  if (content) content.style.display = "block";
}

function renderRows(items, showPoints, emptyText) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<tr><td colspan="5">${escapeHtml(emptyText || "Noch keine Tipps abgegeben.")}</td></tr>`;
  }

  return items.map(item => {
    const result = item.status === "finished" && item.home_goals !== null && item.away_goals !== null
      ? `${item.home_goals} : ${item.away_goals}`
      : "-";
    const tipHome = item.pred_home ?? "-";
    const tipAway = item.pred_away ?? "-";
    const lastCell = showPoints
      ? (item.status === "finished" ? String(item.points ?? 0) : "-")
      : (item.status === "finished" ? "Fertig" : "Offen");

    return `
      <tr>
        <td>${escapeHtml(fmtDate(item.date))}</td>
        <td>${matchHtml(item.home, item.away)}</td>
        <td><strong>${escapeHtml(tipHome)} : ${escapeHtml(tipAway)}</strong></td>
        <td>${escapeHtml(result)}</td>
        <td><strong>${escapeHtml(lastCell)}</strong></td>
      </tr>
    `;
  }).join("");
}

async function loadMyStats() {
  const profileBox = document.getElementById("profileBox");
  const statsBox = document.getElementById("statsBox");
  const honorBody = document.querySelector("#honorStatsTable tbody");
  const funBody = document.querySelector("#funStatsTable tbody");

  if (profileBox) profileBox.innerHTML = "";
  if (statsBox) statsBox.textContent = "Lade Statistik...";
  if (honorBody) honorBody.innerHTML = "";
  if (funBody) funBody.innerHTML = "";

  const me = await api2("me.php").catch(() => null);
  if (!me || me.loggedIn !== true) {
    showLocked("Du musst eingeloggt sein, um deine Statistik zu sehen.");
    return;
  }

  showContent();

  const data = await api2("my_stats.php");
  const user = data.user || {};
  const summary = data.summary || {};

  if (profileBox) {
    profileBox.innerHTML = `
      <div><strong>User:</strong> ${escapeHtml(user.username ?? "-")}</div>
      <div><strong>Email:</strong> ${escapeHtml(user.email ?? "-")}</div>
      <div><strong>User-ID:</strong> ${escapeHtml(user.id ?? "-")}</div>
    `;
  }

  if (statsBox) {
    statsBox.textContent =
      `Tipps: ${summary.total_bets ?? 0} | ` +
      `Ehre: ${summary.honor_bets ?? 0} | ` +
      `Spaß: ${summary.fun_bets ?? 0} | ` +
      `Fertig: ${summary.finished_matches ?? 0} | ` +
      `Exact: ${summary.exact ?? 0} (3P) | ` +
      `Tendenz: ${summary.tendency ?? 0} (1P) | ` +
      `Falsch: ${summary.wrong ?? 0} | ` +
      `Summe Punkte: ${summary.points ?? 0}`;
  }

  if (honorBody) {
    honorBody.innerHTML = renderRows(
      data.honorItems || data.items || [],
      true,
      "Noch keine Ehrentipps abgegeben."
    );
  }
  if (funBody) {
    funBody.innerHTML = renderRows(
      data.funItems || [],
      false,
      "Noch keine Spaßtipps abgegeben."
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMyStats().catch(err => {
    console.error("Statistik Fehler:", err);
    showLocked("Statistik konnte nicht geladen werden.");
  });
});
