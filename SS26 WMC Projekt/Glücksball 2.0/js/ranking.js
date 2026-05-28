console.log("ranking.js geladen");

const RANKING_TEAM_NAMES_DE = {
  "Algeria": "Algerien",
  "Argentina": "Argentinien",
  "Australia": "Australien",
  "Austria": "Österreich",
  "Belgium": "Belgien",
  "Bosnia and Herzegovina": "Bosnien und Herzegowina",
  "Brazil": "Brasilien",
  "Canada": "Kanada",
  "Cape Verde": "Kap Verde",
  "Colombia": "Kolumbien",
  "Croatia": "Kroatien",
  "Curacao": "Curaçao",
  "Czech Republic": "Tschechien",
  "DR Congo": "DR Kongo",
  "Ecuador": "Ecuador",
  "Egypt": "Ägypten",
  "England": "England",
  "France": "Frankreich",
  "Germany": "Deutschland",
  "Ghana": "Ghana",
  "Haiti": "Haiti",
  "Iran": "Iran",
  "Iraq": "Irak",
  "Ivory Coast": "Elfenbeinküste",
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
  "South Africa": "Südafrika",
  "South Korea": "Südkorea",
  "Spain": "Spanien",
  "Sweden": "Schweden",
  "Switzerland": "Schweiz",
  "Tunisia": "Tunesien",
  "Turkey": "Türkei",
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

function renderRanking(rows) {
  const tbody = document.getElementById("rankingBody");
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">Noch keine Tipps oder keine fertigen Matches.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((u, i) => {
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
  } catch (err) {
    console.error("Ranking Fehler:", err);
    if (rankingBody) rankingBody.innerHTML = `<tr><td colspan="5">Ranking konnte nicht geladen werden.</td></tr>`;
    if (favoriteBody) favoriteBody.innerHTML = `<tr><td colspan="5">WM-Favoriten konnten nicht geladen werden.</td></tr>`;
  }
}
