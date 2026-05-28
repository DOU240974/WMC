const FUN_FLAGS = {
  "Ägypten": "eg",
  "Algerien": "dz",
  "Argentinien": "ar",
  "Belgien": "be",
  "Brasilien": "br",
  "Chile": "cl",
  "Dänemark": "dk",
  "Deutschland": "de",
  "England": "gb-eng",
  "Frankreich": "fr",
  "Ghana": "gh",
  "Griechenland": "gr",
  "Honduras": "hn",
  "Irak": "iq",
  "Italien": "it",
  "Kroatien": "hr",
  "Luxemburg": "lu",
  "Marokko": "ma",
  "Neuseeland": "nz",
  "Niederlande": "nl",
  "Nigeria": "ng",
  "Nordirland": "gb-nir",
  "Nordmazedonien": "mk",
  "Norwegen": "no",
  "Österreich": "at",
  "Oesterreich": "at",
  "Polen": "pl",
  "Portugal": "pt",
  "Schweden": "se",
  "Spanien": "es",
  "Tunesien": "tn",
  "Türkei": "tr",
  "Ukraine": "ua",
  "USA": "us",
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

function flagUrl(teamName) {
  const code = FUN_FLAGS[String(teamName || "").trim()];
  return code ? `https://flagcdn.com/w40/${code}.png` : "image/flag-placeholder.png";
}

function teamHtml(teamName) {
  const safeName = escapeHtml(teamName);
  return `
    <img class="flag" src="${escapeHtml(flagUrl(teamName))}" alt="${safeName}" onerror="this.onerror=null;this.src='image/flag-placeholder.png';">
    <div class="team-name">${safeName}</div>
  `;
}

function formatDate(value) {
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

function visibleVenue(value) {
  const venue = String(value || "").trim();
  return /^tbd$/i.test(venue) ? "" : venue;
}

function matchLocationText(match) {
  return visibleVenue(match.venue);
}

async function funApi(path, data) {
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

function renderFunMatches(matches) {
  const wrap = document.getElementById("funMatches");
  if (!wrap) return;

  const openMatches = matches.filter(match => {
    const kickoff = match.date && new Date(String(match.date).replace(" ", "T")).getTime();
    return !kickoff || kickoff > Date.now();
  });

  wrap.innerHTML = openMatches.map(match => {
    const kickoffMs = match.date ? new Date(String(match.date).replace(" ", "T")).getTime() : 0;
    const locked = kickoffMs && kickoffMs <= Date.now();
    const hasTip = match.tipp_home !== null && match.tipp_away !== null;
    const badgeText = hasTip ? "Getippt" : "Tipp bis Spielbeginn";

    return `
      <article class="ko-card fun-tip-card ${hasTip ? "is-tipped" : ""} ${locked ? "is-locked" : ""}" data-kickoff="${escapeHtml(kickoffMs)}">
        <div class="ko-head">
          <div class="ko-stage">Freundschaftsspiel <span class="lock-badge">${escapeHtml(badgeText)}</span></div>
          <div class="ko-meta">${escapeHtml(formatDate(match.date))}</div>
        </div>

        <div class="teams-line">
          <div class="team-inline">${teamHtml(match.team_home)}</div>
          <div class="vs">VS</div>
          <div class="team-inline">${teamHtml(match.team_away)}</div>
        </div>

        <div class="tip-row">
          <input class="score-input ${hasTip ? "is-saved" : ""}" type="number" min="0" max="20" data-home value="${hasTip ? escapeHtml(match.tipp_home) : ""}" ${locked ? "disabled" : ""}>
          <span class="sep">:</span>
          <input class="score-input ${hasTip ? "is-saved" : ""}" type="number" min="0" max="20" data-away value="${hasTip ? escapeHtml(match.tipp_away) : ""}" ${locked ? "disabled" : ""}>
        </div>

        <div class="card-actions ${matchLocationText(match) ? "" : "no-location"}">
          <div class="small">${escapeHtml(matchLocationText(match))}</div>
          <button class="btn" type="button" data-save="${escapeHtml(match.id)}" ${locked ? "disabled" : ""}>
            ${hasTip ? "Tipp ändern" : "Tipp speichern"}
          </button>
        </div>
      </article>
    `;
  }).join("") || `<div class="notice">Keine Spaßtipps gefunden.</div>`;
}

function startFunCardExpiryWatcher() {
  setInterval(() => {
    document.querySelectorAll("#funMatches .ko-card[data-kickoff]").forEach(card => {
      const kickoffMs = Number(card.getAttribute("data-kickoff") || "0");
      if (kickoffMs && kickoffMs <= Date.now()) card.remove();
    });
  }, 1000);
}

async function initSpasstipp() {
  const notice = document.getElementById("authNotice");
  const data = await funApi("fun_matches.php");
  const matches = data.matches || [];

  if (notice && !data.loggedIn) {
    notice.style.display = "block";
    notice.textContent = "Du kannst die Spiele ansehen. Zum Speichern bitte oben einloggen.";
  }

  renderFunMatches(matches);
  startFunCardExpiryWatcher();

  document.getElementById("funMatches")?.addEventListener("click", async (event) => {
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
      await funApi("fun_place_tip.php", { spiel_id: spielId, tipp_home: Number(home), tipp_away: Number(away) });
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
}

document.addEventListener("DOMContentLoaded", () => {
  initSpasstipp().catch(err => {
    const wrap = document.getElementById("funMatches");
    if (wrap) wrap.innerHTML = `<div class="notice">${escapeHtml(err.message)}</div>`;
  });
});



