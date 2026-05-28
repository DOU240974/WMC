const GROUPS = ["Alle", "Group A", "Group B", "Group C", "Group D", "Group E", "Group F", "Group G", "Group H", "Group I", "Group J", "Group K", "Group L"];

const TEAM_FLAGS = {
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

const TEAM_NAMES_DE = {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function flagUrl(teamName) {
  const code = TEAM_FLAGS[String(teamName || "").trim()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "image/flag-placeholder.png";
}

function teamDisplayName(teamName) {
  return TEAM_NAMES_DE[String(teamName || "").trim()] || String(teamName || "").trim();
}

function teamDisplayHtml(teamName) {
  const display = teamDisplayName(teamName);
  if (/\sund\s/i.test(display)) {
    return escapeHtml(display).replace(/\sund\s/i, " und<wbr> ");
  }
  return escapeHtml(display).replaceAll(" ", "&nbsp;");
}

function teamHtml(teamName) {
  const display = teamDisplayName(teamName);
  return `
    <img class="flag" src="${escapeHtml(flagUrl(teamName))}" alt="${escapeHtml(display)}" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">
    <div class="team-name ${/\sund\s/i.test(display) ? "can-wrap" : ""}">${teamDisplayHtml(teamName)}</div>
  `;
}

async function wmApi(path, data) {
  const res = await fetch(`api/${path}`, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
    cache: "no-store"
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error || "Fehler");
  return json;
}

function formatMatchDate(value) {
  if (!value) return "Spielbeginn offen";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function groupLabel(group) {
  return group === "Alle" ? "Alle Gruppen" : group.replace("Group ", "Gruppe ");
}

function formatDeadline(value) {
  if (!value) return "Beginn des ersten WM-Spiels offen";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function setFavoriteDisabled(disabled) {
  document.getElementById("wmChampionTeam")?.toggleAttribute("disabled", disabled);
  document.getElementById("wmTopScorer")?.toggleAttribute("disabled", disabled);
  document.getElementById("wmTotalGoals")?.toggleAttribute("disabled", disabled);
  document.getElementById("wmFavoriteSave")?.toggleAttribute("disabled", disabled);
}

function visibleVenue(value) {
  const venue = String(value || "").trim();
  return /^tbd$/i.test(venue) ? "" : venue;
}

async function loadWmFavorite() {
  const card = document.getElementById("wmFavoriteCard");
  if (!card) return;

  const status = document.getElementById("wmFavoriteStatus");
  const hint = document.getElementById("wmFavoriteHint");
  const teamSelect = document.getElementById("wmChampionTeam");
  const scorerInput = document.getElementById("wmTopScorer");
  const goalsInput = document.getElementById("wmTotalGoals");
  const saveButton = document.getElementById("wmFavoriteSave");

  try {
    const data = await wmApi("wm_favorite.php");
    const teams = data.teams || [];
    const favorite = data.favorite || null;

    if (teamSelect) {
      teamSelect.innerHTML = `<option value="">Land auswählen</option>` + teams.map(team => `
        <option value="${escapeHtml(team)}">${escapeHtml(team)}</option>
      `).join("");
      if (favorite?.champion_team) teamSelect.value = favorite.champion_team;
    }

    if (scorerInput && favorite?.top_scorer) scorerInput.value = favorite.top_scorer;
    if (goalsInput && favorite?.total_goals !== undefined && favorite?.total_goals !== null) {
      goalsInput.value = favorite.total_goals;
    }

    if (status) status.textContent = data.locked ? "Gesperrt" : "Bis erstes WM-Spiel";
    if (hint) {
      hint.textContent = data.locked
        ? `Gesperrt seit Beginn des ersten WM-Spiels (${formatDeadline(data.deadline)}). Je Kategorie gibt es 25 Punkte.`
        : `WM-Favorit bis zum ersten WM-Spiel (${formatDeadline(data.deadline)}). Je Kategorie gibt es 25 Punkte.`;
    }

    setFavoriteDisabled(Boolean(data.locked));
    if (saveButton && !data.loggedIn) saveButton.disabled = true;
    if (hint && !data.loggedIn) hint.textContent = "Zum Speichern bitte oben einloggen. Je Kategorie gibt es 25 Punkte.";
  } catch (err) {
    if (hint) hint.textContent = err.message;
    if (status) status.textContent = "Fehler";
    setFavoriteDisabled(true);
  }
}

async function saveWmFavorite() {
  const teamSelect = document.getElementById("wmChampionTeam");
  const scorerInput = document.getElementById("wmTopScorer");
  const goalsInput = document.getElementById("wmTotalGoals");
  const saveButton = document.getElementById("wmFavoriteSave");
  const hint = document.getElementById("wmFavoriteHint");

  const champion = teamSelect?.value || "";
  const scorer = scorerInput?.value.trim() || "";
  const goals = goalsInput?.value || "";

  if (!champion || !scorer || goals === "") {
    alert("Bitte Weltmeister, Top-Torjäger und gesamte Tore ausfüllen.");
    return;
  }

  if (saveButton) saveButton.disabled = true;
  try {
    await wmApi("wm_favorite.php", {
      champion_team: champion,
      top_scorer: scorer,
      total_goals: Number(goals)
    });
    if (hint) hint.textContent = "WM-Favorit gespeichert. Jede richtige Kategorie bringt 25 Punkte.";
    if (saveButton) {
      saveButton.textContent = "Gespeichert";
      setTimeout(() => {
        saveButton.textContent = "WM-Favorit ändern";
        saveButton.disabled = false;
      }, 900);
    }
  } catch (err) {
    alert(err.message);
    if (saveButton) saveButton.disabled = false;
  }
}

function renderGroupFilters(activeGroup) {
  const filters = document.getElementById("wmFilters");
  if (!filters) return;

  filters.innerHTML = GROUPS.map(group => `
    <button class="chip ${group === activeGroup ? "active" : ""}" type="button" data-group="${escapeHtml(group)}">
      ${escapeHtml(groupLabel(group))}
    </button>
  `).join("");
}

function renderMatches(matches, activeGroup) {
  const wrap = document.getElementById("wmMatches");
  if (!wrap) return;

  const filtered = activeGroup === "Alle"
    ? matches
    : matches.filter(match => match.group_name === activeGroup);

  const openMatches = filtered.filter(match => {
    const kickoff = match.date && new Date(String(match.date).replace(" ", "T")).getTime();
    return !kickoff || kickoff > Date.now();
  });

  wrap.innerHTML = openMatches.map(match => {
    const kickoffMs = match.date ? new Date(String(match.date).replace(" ", "T")).getTime() : 0;
    const locked = kickoffMs && kickoffMs <= Date.now();
    const hasTip = match.tipp_home !== null && match.tipp_away !== null;
    const badgeText = hasTip ? "Getippt" : "Tipp bis Spielbeginn";

    return `
      <article class="ko-card ${hasTip ? "is-tipped" : ""} ${locked ? "is-locked" : ""}" data-spiel-id="${escapeHtml(match.id)}" data-kickoff="${escapeHtml(kickoffMs)}">
        <div class="ko-head">
          <div class="ko-stage">${escapeHtml(groupLabel(match.group_name))} <span class="lock-badge">${escapeHtml(badgeText)}</span></div>
          <div class="ko-meta">${escapeHtml(formatMatchDate(match.date))}</div>
        </div>

        <div class="teams-line">
          <div class="team-inline">
            ${teamHtml(match.team_home)}
          </div>
          <div class="vs">VS</div>
          <div class="team-inline">
            ${teamHtml(match.team_away)}
          </div>
        </div>

        <div class="tip-row">
          <input class="score-input ${hasTip ? "is-saved" : ""}" type="number" min="0" max="20" data-home value="${hasTip ? escapeHtml(match.tipp_home) : ""}" ${locked ? "disabled" : ""}>
          <span class="sep">:</span>
          <input class="score-input ${hasTip ? "is-saved" : ""}" type="number" min="0" max="20" data-away value="${hasTip ? escapeHtml(match.tipp_away) : ""}" ${locked ? "disabled" : ""}>
        </div>

        <div class="card-actions">
          <div class="small">${escapeHtml(match.match_id)}${visibleVenue(match.venue) ? " · " + escapeHtml(visibleVenue(match.venue)) : ""}</div>
          <button class="btn" type="button" data-save="${escapeHtml(match.id)}" ${locked ? "disabled" : ""}>
            ${hasTip ? "Tipp ändern" : "Tipp speichern"}
          </button>
        </div>
      </article>
    `;
  }).join("") || `<div class="notice">Keine Spiele gefunden.</div>`;
}

function startTipCardExpiryWatcher(containerId) {
  setInterval(() => {
    document.querySelectorAll(`#${containerId} .ko-card[data-kickoff]`).forEach(card => {
      const kickoffMs = Number(card.getAttribute("data-kickoff") || "0");
      if (kickoffMs && kickoffMs <= Date.now()) card.remove();
    });
  }, 1000);
}

async function loadWmFavorite() {
  const card = document.getElementById("wmFavoriteCard");
  if (!card) return;

  const status = document.getElementById("wmFavoriteStatus");
  const hint = document.getElementById("wmFavoriteHint");
  const teamSelect = document.getElementById("wmChampionTeam");
  const scorerInput = document.getElementById("wmTopScorer");
  const goalsInput = document.getElementById("wmTotalGoals");
  const saveButton = document.getElementById("wmFavoriteSave");

  try {
    const data = await wmApi("wm_favorite.php");
    const teams = data.teams || [];
    const favorite = data.favorite || null;

    if (teamSelect) {
      const sortedTeams = [...teams].sort((a, b) => teamDisplayName(a).localeCompare(teamDisplayName(b), "de"));
      teamSelect.innerHTML = `<option value="">Land auswählen</option>` + sortedTeams.map(team => `
        <option value="${escapeHtml(team)}">${escapeHtml(teamDisplayName(team))}</option>
      `).join("");
      if (favorite?.champion_team) teamSelect.value = favorite.champion_team;
    }

    if (scorerInput && favorite?.top_scorer) scorerInput.value = favorite.top_scorer;
    if (goalsInput && favorite?.total_goals !== undefined && favorite?.total_goals !== null) {
      goalsInput.value = favorite.total_goals;
    }

    if (status) status.textContent = data.locked ? "Gesperrt" : "Bis erstes WM-Spiel";
    if (hint) {
      hint.textContent = data.locked
        ? `Gesperrt seit Beginn des ersten WM-Spiels (${formatDeadline(data.deadline)}). Je Kategorie gibt es 25 Punkte.`
        : `WM-Favorit bis zum ersten WM-Spiel (${formatDeadline(data.deadline)}). Je Kategorie gibt es 25 Punkte.`;
    }

    setFavoriteDisabled(Boolean(data.locked));
    if (saveButton && !data.loggedIn) saveButton.disabled = true;
    if (hint && !data.loggedIn) hint.textContent = "Zum Speichern bitte oben einloggen. Je Kategorie gibt es 25 Punkte.";
  } catch (err) {
    if (hint) hint.textContent = err.message;
    if (status) status.textContent = "Fehler";
    setFavoriteDisabled(true);
  }
}

async function initWmTipps() {
  const notice = document.getElementById("authNotice");
  let activeGroup = "Alle";

  try {
    loadWmFavorite();
    document.getElementById("wmFavoriteSave")?.addEventListener("click", saveWmFavorite);

    const data = await wmApi("wm_matches.php");
    const matches = data.matches || [];

    if (notice && !data.loggedIn) {
      notice.style.display = "block";
      notice.innerHTML = "Du kannst die WM-Gruppenspiele ansehen. Zum Tippen bitte oben einloggen.";
    }

    renderGroupFilters(activeGroup);
    renderMatches(matches, activeGroup);
    startTipCardExpiryWatcher("wmMatches");

    document.getElementById("wmFilters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-group]");
      if (!button) return;
      activeGroup = button.getAttribute("data-group") || "Alle";
      renderGroupFilters(activeGroup);
      renderMatches(matches, activeGroup);
    });

    document.getElementById("wmMatches")?.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-save]");
      if (!button) return;

      const card = button.closest(".ko-card");
      const spielId = Number(button.getAttribute("data-save"));
      const home = card?.querySelector("[data-home]")?.value;
      const away = card?.querySelector("[data-away]")?.value;

      if (home === "" || away === "") {
        alert("Bitte beide Tore eingeben.");
        return;
      }

      button.disabled = true;
      try {
        await wmApi("wm_place_tip.php", { spiel_id: spielId, tipp_home: Number(home), tipp_away: Number(away) });
        const match = matches.find(item => Number(item.id) === spielId);
        if (match) {
          match.tipp_home = Number(home);
          match.tipp_away = Number(away);
        }
        button.textContent = "Gespeichert";
        card?.classList.add("is-tipped");
        card?.querySelector(".lock-badge")?.replaceChildren(document.createTextNode("Getippt"));
        card?.querySelectorAll(".score-input").forEach(input => input.classList.add("is-saved"));
        setTimeout(() => {
          button.textContent = "Tipp ändern";
          button.disabled = false;
        }, 900);
      } catch (err) {
        alert(err.message);
        button.disabled = false;
      }
    });
  } catch (err) {
    const wrap = document.getElementById("wmMatches");
    if (wrap) wrap.innerHTML = `<div class="notice">${escapeHtml(err.message)}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", initWmTipps);

