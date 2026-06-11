console.log("ranking.js geladen");

const RANKING_TEAM_NAMES_DE = {
  "Algeria": "Algerien",
  "Argentina": "Argentinien",
  "Australia": "Australien",
  "Austria": "Oesterreich",
  "Belgium": "Belgien",
  "Bosnia and Herzegovina": "Bosnien und Herzegowina",
  "Brazil": "Brasilien",
  "Canada": "Kanada",
  "Cape Verde": "Kap Verde",
  "Colombia": "Kolumbien",
  "Croatia": "Kroatien",
  "Curacao": "Curacao",
  "Czech Republic": "Tschechien",
  "DR Congo": "DR Kongo",
  "Ecuador": "Ecuador",
  "Egypt": "Aegypten",
  "England": "England",
  "France": "Frankreich",
  "Germany": "Deutschland",
  "Ghana": "Ghana",
  "Haiti": "Haiti",
  "Iran": "Iran",
  "Iraq": "Irak",
  "Ivory Coast": "Elfenbeinkueste",
  "Japan": "Japan",
  "Jordan": "Jordanien",
  "Mexico": "Mexiko",
  "Morocco": "Marokko",
  "Netherlands": "Niederlande",
  "New Zealand": "Neuseeland",
  "Norway": "Norwegen",
  "Panama": "Panama",
  "Paraguay": "Paraguay",
  "Portugal": "Portugal",
  "Qatar": "Katar",
  "Saudi Arabia": "Saudi-Arabien",
  "Scotland": "Schottland",
  "Senegal": "Senegal",
  "South Africa": "Suedafrika",
  "South Korea": "Suedkorea",
  "Spain": "Spanien",
  "Sweden": "Schweden",
  "Switzerland": "Schweiz",
  "Tunisia": "Tunesien",
  "Turkey": "Tuerkei",
  "United States": "USA",
  "Uruguay": "Uruguay",
  "Uzbekistan": "Usbekistan"
};

const RANKING_TEAM_FLAGS = {
  "Algeria": "dz",
  "Argentina": "ar",
  "Australia": "au",
  "Austria": "at",
  "Belgium": "be",
  "Bosnia and Herzegovina": "ba",
  "Brazil": "br",
  "Canada": "ca",
  "Cape Verde": "cv",
  "Colombia": "co",
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
  "Uzbekistan": "uz"
};

document.addEventListener("DOMContentLoaded", loadRanking);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function teamNameDe(value) {
  return RANKING_TEAM_NAMES_DE[String(value || "").trim()] || String(value || "").trim();
}

function teamFlagUrl(value) {
  const code = RANKING_TEAM_FLAGS[String(value || "").trim()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "image/flag-placeholder.png";
}

function favoriteTeamHtml(value) {
  if (!value) return "-";
  const name = teamNameDe(value);
  return `
    <span class="stat-team">
      <img class="flag" src="${escapeHtml(teamFlagUrl(value))}" alt="${escapeHtml(name)}" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">
      <span>${escapeHtml(name)}</span>
    </span>
  `;
}

function sortRankingRows(rows) {
  return [...rows].sort((a, b) => {
    const pointsDiff = Number(b.points ?? 0) - Number(a.points ?? 0);
    if (pointsDiff !== 0) return pointsDiff;

    const exactDiff = Number(b.exact_tips ?? 0) - Number(a.exact_tips ?? 0);
    if (exactDiff !== 0) return exactDiff;

    const tipsDiff = Number(a.tips ?? 0) - Number(b.tips ?? 0);
    if (tipsDiff !== 0) return tipsDiff;

    return String(a.display_name ?? a.username ?? "").localeCompare(String(b.display_name ?? b.username ?? ""), "de");
  });
}

function renderRanking(rows) {
  const tbody = document.getElementById("rankingBody");
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Noch keine Tipps oder keine fertigen Matches.</td></tr>`;
    return;
  }

  tbody.innerHTML = sortRankingRows(rows).map((u, i) => {
    const name = u.display_name ?? u.username ?? ("User#" + u.user_id);
    const points = Number(u.points ?? 0);
    const tips = Number(u.tips ?? 0);
    const hits = Number(u.hits ?? 0);
    const finished = Number(u.finished_tips ?? 0);
    const hitRate = finished > 0 ? Math.round((hits / finished) * 100) : 0;

    return `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(name)}</td>
        <td><strong>${points}</strong></td>
        <td>${tips}</td>
        <td><strong>${hits}/${finished}</strong> (${hitRate}%)</td>
      </tr>
    `;
  }).join("");
}

function renderFavorites(rows) {
  const tbody = document.getElementById("favoriteRankingBody");
  if (!tbody) return;

  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Noch keine WM-Favoriten abgegeben.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(row => {
    const name = row.display_name ?? row.username ?? ("User#" + row.user_id);
    const bonus =
      Number(row.points_champion ?? 0) +
      Number(row.points_top_scorer ?? 0) +
      Number(row.points_total_goals ?? 0);

    return `
      <tr>
        <td>${escapeHtml(name)}</td>
        <td>${favoriteTeamHtml(row.champion_team)}</td>
        <td>${escapeHtml(row.top_scorer || "-")}</td>
        <td>${escapeHtml(row.total_goals ?? "-")}</td>
        <td><strong>${bonus}</strong></td>
      </tr>
    `;
  }).join("");
}

function renderHallOfFame(rows, isComplete) {
  // Hall of Fame bleibt vor WM-Ende komplett unsichtbar.
  // Erst wenn die API complete=true liefert, werden die Top 3 angezeigt.
  const section = document.getElementById("hallOfFameSection");
  const box = document.getElementById("hallOfFame");
  if (!box) return;

  if (!isComplete) {
    if (section) section.style.display = "none";
    box.innerHTML = "";
    return;
  }

  if (section) section.style.display = "block";

  if (!rows || rows.length === 0) {
    box.innerHTML = `<p class="muted">Noch keine Ranking-Daten vorhanden.</p>`;
    return;
  }

  box.innerHTML = `
    <div class="hall-of-fame-grid">
      ${rows.slice(0, 3).map((row, index) => {
        const name = row.display_name ?? row.username ?? ("User#" + row.user_id);
        const points = Number(row.points ?? 0);
        const tips = Number(row.tips ?? 0);
        return `
          <article class="hall-card hall-rank-${index + 1}">
            <div class="hall-place">${index + 1}</div>
            <h3>${escapeHtml(name)}</h3>
            <p><strong>${points}</strong> Punkte</p>
            <span>${tips} Tipps</span>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

async function loadRanking() {
  const rankingBody = document.getElementById("rankingBody");
  const favoriteBody = document.getElementById("favoriteRankingBody");
  if (rankingBody) rankingBody.innerHTML = `<tr><td colspan="5">Lade Ranking...</td></tr>`;
  if (favoriteBody) favoriteBody.innerHTML = `<tr><td colspan="5">Lade WM-Favoriten...</td></tr>`;

  try {
    const res = await fetch("api/ranking.php", {
      credentials: "include",
      cache: "no-store"
    });
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Ranking NON-JSON:", text);
      throw new Error("Server lieferte kein JSON");
    }

    if (!data.ok) throw new Error(data.error || "API ok=false");
    if (!Array.isArray(data.ranking)) throw new Error("ranking[] fehlt");

    renderRanking(data.ranking);
    renderFavorites(data.favorites || []);
    renderHallOfFame(data.hall_of_fame || [], Boolean(data.wmFavoriteResult?.complete));
  } catch (err) {
    console.error("Ranking Fehler:", err);
    if (rankingBody) rankingBody.innerHTML = `<tr><td colspan="5">Ranking konnte nicht geladen werden.</td></tr>`;
    if (favoriteBody) favoriteBody.innerHTML = `<tr><td colspan="5">WM-Favoriten konnten nicht geladen werden.</td></tr>`;
    renderHallOfFame([], false);
  }
}
