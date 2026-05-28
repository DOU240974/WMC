/* =========================================================
   WM / CAF – Anzeige + Tipps
   ========================================================= */

let AFCON = null;
let TEAMS_MAP = Object.create(null);

const state = {
    tournament: "WM",
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

function getEl(...ids) {
    for (const id of ids) {
        const el = document.getElementById(id);
        if (el) return el;
    }
    return null;
}

function escapeHtml(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function makeFlagHtml(flagUrl) {
    const safe = escapeHtml(flagUrl || "");

    if (!safe) {
        return `<div class="flag placeholder"></div>`;
    }

    return `
    <img
      class="flag"
      src="${safe}"
      alt=""
      onerror="this.onerror=null;this.src='image/flag-placeholder.png';">
  `;
}

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

/* ---------- Teams ---------- */

function buildTeamsMap() {
    TEAMS_MAP = Object.create(null);

    (AFCON?.teams || []).forEach(team => {
        if (team?.name) {
            TEAMS_MAP[String(team.name)] = team;
        }
    });
}

function flagFromIso(iso2) {
    if (!iso2) return "";

    const base = AFCON?.flags?.base || "https://flagcdn.com/w40/";
    const ext = AFCON?.flags?.ext || ".png";

    return `${base}${String(iso2).toLowerCase()}${ext}`;
}

function teamDisplayName(team) {
    if (!team) return "";

    if (typeof team === "string") {
        return team;
    }

    return team.name || team.label || "";
}

function teamIsKnownName(teamLike) {
    const name = teamDisplayName(teamLike);

    const n = String(name ?? "")
        .trim()
        .toLowerCase();

    if (!n) return false;

    if (n === "tbd") return false;

    if (n.startsWith("winner")) return false;
    if (n.startsWith("loser")) return false;

    return true;
}

/* ---------- Date ---------- */

function parseKickoff(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;

    const d = new Date(`${dateStr}T${timeStr}:00`);

    return isNaN(d.getTime()) ? null : d;
}

/* ---------- User ---------- */

function getUid() {
    const me = window.ME || {};

    const uid =
        me.id ??
        me.user_id ??
        me.userId ??
        null;

    return uid != null
        ? String(uid)
        : "guest";
}

/* ---------- Name Helpers ---------- */

function normTeamName(name) {
    return String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replaceAll("’", "'");
}

function mapTeamAlias(name) {
    const n = normTeamName(name);

    if (n === "dr congo") return "dr congo";
    if (n === "dr kongo") return "dr congo";

    if (n === "elfenbein küste") {
        return "elfenbeinküste";
    }

    return n;
}

/* ---------- API ---------- */

async function api(path, data) {

    const res = await fetch(`api/${path}`, {
        method: data ? "POST" : "GET",
        headers: data
            ? { "Content-Type": "application/json" }
            : undefined,
        credentials: "include",
        cache: "no-store",
        body: data
            ? JSON.stringify(data)
            : undefined
    });

    const text = await res.text();

    try {
        return JSON.parse(text);
    } catch {
        console.error(text);

        return {
            ok: false,
            error: "Server Error"
        };
    }
}

async function apiMe() {
    return api("me.php");
}

async function apiLogout() {

    await fetch("api/logout.php", {
        credentials: "include"
    });

    window.ME = null;

    location.href = "index.html";
}

/* ---------- Bets ---------- */

async function placeBet(matchId, predHome, predAway) {

    const data = await api("place_bet.php", {
        match_id: String(matchId),
        pred_home: Number(predHome),
        pred_away: Number(predAway)
    });

    if (!data?.ok) {
        alert(data?.error || "Fehler");
        return false;
    }

    return true;
}

async function loadMyBets() {

    const data = await api("my_bets.php");

    if (!data?.ok) return {};

    const map = {};

    (data.bets || []).forEach(b => {
        map[String(b.match_id)] = b;
    });

    return map;
}

/* ---------- JSON ---------- */

async function loadAfconJson() {

    const res = await fetch("data/caf.json", {
        cache: "no-store"
    });

    AFCON = await res.json();

    try {
        const standingsRes = await fetch("api/sportmonks_standings.php", {
            cache: "no-store"
        });
        const standings = await standingsRes.json();

        if (standings?.ok && Array.isArray(standings.groups) && standings.groups.length > 0) {
            AFCON.groups = standings.groups;
        }
    } catch (err) {
        console.warn("Sportmonks Gruppen nicht geladen:", err);
    }

    buildTeamsMap();
}

/* ---------- KO Meta ---------- */

function getKoMetaFromJson(matchId) {

    const idStr = String(matchId);

    const rounds = AFCON?.knockout || [];

    for (const round of rounds) {

        for (const m of (round.matches || [])) {

            if (String(m.id) === idStr) {

                return {
                    date: m.date || "",
                    time: m.time || ""
                };
            }
        }
    }

    return null;
}

/* ---------- DB Matches ---------- */

async function loadKoMatchesFromDb() {

    const data = await api("ko_matches.php");

    if (!data?.ok) return [];

    const base =
        AFCON?.flags?.base ||
        "https://flagcdn.com/w40/";

    const ext =
        AFCON?.flags?.ext ||
        ".png";

    const isoMap = new Map();

    (AFCON?.teams || []).forEach(t => {
        isoMap.set(
            normTeamName(t.name),
            String(t.iso2 || "")
        );
    });

    return (data.matches || []).map(row => {

        const homeKey =
            mapTeamAlias(row.home_name);

        const awayKey =
            mapTeamAlias(row.away_name);

        let homeIso2 =
            isoMap.get(homeKey) || "";

        let awayIso2 =
            isoMap.get(awayKey) || "";

        const dt =
            String(row.match_date || "");

        const dbDate = dt.slice(0, 10);

        const dbTime =
            dt.length >= 16
                ? dt.slice(11, 16)
                : "";

        let date = dbDate;
        let time = dbTime;

        if (!time || time === "00:00") {

            const meta =
                getKoMetaFromJson(row.id);

            if (meta?.time) {
                time = meta.time;
            }

            if (meta?.date) {
                date = meta.date;
            }
        }

        return {
            id: String(row.id),
            stage: "Round of 16",
            date,
            time,
            venue: "",

            home: {
                name: row.home_name || "?",
                flag: homeIso2
                    ? `${base}${homeIso2}${ext}`
                    : ""
            },

            away: {
                name: row.away_name || "?",
                flag: awayIso2
                    ? `${base}${awayIso2}${ext}`
                    : ""
            }
        };
    });
}

/* ---------- Tipps Cards ---------- */

function koBetCardWithState(match, myBetsMap) {

    const matchId = match.id;

    if (!matchId) return "";

    const homeName = match.home?.name;
    const awayName = match.away?.name;

    if (
        !teamIsKnownName(homeName) ||
        !teamIsKnownName(awayName)
    ) {
        return "";
    }

    const meta = [
        match.date,
        match.time,
        match.venue
    ]
        .filter(Boolean)
        .join(" • ");

    const hId = `h_${matchId}`;
    const aId = `a_${matchId}`;

    const kickoff =
        parseKickoff(match.date, match.time);

    const kickoffMs =
        kickoff
            ? kickoff.getTime()
            : 0;

    const locked =
        kickoff
            ? Date.now() >= kickoffMs
            : false;
    if (locked) return "";

    const existing =
        myBetsMap[String(matchId)];

    const hasTip = !!existing;

    const cardClass =
        "ko-card" +
        (hasTip ? " is-tipped" : "") +
        (locked ? " is-locked" : "");

    const badge =
        `<span class="lock-badge">${hasTip ? "Getippt" : "Tipp bis Spielbeginn"}</span>`;

    const valH =
        hasTip
            ? escapeHtml(existing.pred_home)
            : "";

    const valA =
        hasTip
            ? escapeHtml(existing.pred_away)
            : "";

    return `
    <article
      class="${cardClass}"
      data-match-id="${escapeHtml(matchId)}"
      data-kickoff="${kickoffMs}">

      <div class="ko-head">
        <div class="ko-stage">
          ${escapeHtml(stageLabel(match.stage))}
          ${badge}
        </div>

        <div class="ko-meta">
          ${escapeHtml(meta)}
        </div>
      </div>

      <div class="teams-line">

        <div class="team-inline">
          ${makeFlagHtml(match.home?.flag)}
          <div class="team-name">
            ${escapeHtml(homeName)}
          </div>
        </div>

        <div class="vs">VS</div>

        <div class="team-inline">
          ${makeFlagHtml(match.away?.flag)}
          <div class="team-name">
            ${escapeHtml(awayName)}
          </div>
        </div>

      </div>

      <div class="tip-row">

        <input
          class="score-input"
          id="${escapeHtml(hId)}"
          type="number"
          min="0"
          max="20"
          value="${valH}"
          ${locked ? "disabled" : ""}>

        <span class="sep">:</span>

        <input
          class="score-input"
          id="${escapeHtml(aId)}"
          type="number"
          min="0"
          max="20"
          value="${valA}"
          ${locked ? "disabled" : ""}>

      </div>

      <div class="card-actions">

        <div class="small">
          Match-ID: ${escapeHtml(matchId)}
        </div>

        <button
          class="btn"
          data-save="${escapeHtml(matchId)}"
          ${locked ? "disabled" : ""}>

          ${hasTip ? "Tipp ändern" : "Tipp speichern"}

        </button>

      </div>

    </article>
  `;
}

/* ---------- Lock Watcher ---------- */

function startLiveLockWatcher() {

    setInterval(() => {

        document
            .querySelectorAll(".ko-card[data-kickoff]")
            .forEach(card => {

                const kickoffMs = Number(
                    card.getAttribute("data-kickoff") || "0"
                );

                if (!kickoffMs) return;

                if (
                    Date.now() >= kickoffMs &&
                    !card.classList.contains("is-locked")
                ) {

                    card.remove();
                }
            });

    }, 1000);
}

/* ---------- Tipps Init ---------- */

async function initTippsPage() {

    const wrap = getEl("koMatches");

    if (!wrap) return;

    const notice =
        getEl("authNotice");

    const me = await apiMe();

    const loggedIn =
        !!(
            me &&
            (
                me.loggedIn === true ||
                me.logged_in === true
            )
        );

    if (!loggedIn) {

        if (notice) {

            notice.style.display = "block";

            notice.innerHTML = `
        Du musst eingeloggt sein.
      `;
        }

        wrap.innerHTML = "";

        return;
    }

    window.ME = me;

    state.user = me;

    saveState();

    const myBetsMap =
        await loadMyBets();

    const matches =
        await loadKoMatchesFromDb();

    const htmlCards =
        matches
            .map(m => koBetCardWithState(m, myBetsMap))
            .filter(Boolean);

    wrap.innerHTML =
        htmlCards.join("") ||
        `<div class="notice">Keine Spiele.</div>`;

    startLiveLockWatcher();

    wrap
        .querySelectorAll("button[data-save]")
        .forEach(btn => {

            btn.addEventListener("click", async () => {

                const matchId =
                    btn.getAttribute("data-save");

                const hInput =
                    document.getElementById(`h_${matchId}`);

                const aInput =
                    document.getElementById(`a_${matchId}`);

                const ph =
                    hInput?.value ?? "";

                const pa =
                    aInput?.value ?? "";

                if (ph === "" || pa === "") {
                    alert("Bitte beide Tore eingeben.");
                    return;
                }

                btn.disabled = true;

                const ok =
                    await placeBet(matchId, ph, pa);

                btn.disabled = false;

                if (!ok) return;

                myBetsMap[String(matchId)] = {
                    match_id: String(matchId),
                    pred_home: Number(ph),
                    pred_away: Number(pa)
                };

                state.myBets = myBetsMap;

                saveState();

                const card = btn.closest(".ko-card");
                if (card) card.classList.add("is-tipped");
                card?.querySelector(".lock-badge")?.replaceChildren(document.createTextNode("Getippt"));

                btn.textContent = "Gespeichert";

                setTimeout(() => {
                    btn.textContent = "Tipp ändern";
                }, 1200);

            });

        });

}

/* ---------- Gruppen ---------- */

function renderGroups() {

    const container =
        getEl("groupsContainer", "groups");

    if (!container) return;

    if (!Array.isArray(AFCON?.groups)) {

        container.innerHTML =
            `<div class="notice">Keine Gruppen.</div>`;

        return;
    }

    const html = AFCON.groups.map(g => {

        const rows = (g.table || []).map(r => {

            const t = TEAMS_MAP[r.team];

            const flagUrl =
                r.flag ||
                flagFromIso(r.iso2) ||
                t?.flag ||
                flagFromIso(t?.iso2);

            return `
        <tr>

          <td class="teamcell">
            ${makeFlagHtml(flagUrl)}
            <span>${escapeHtml(r.team)}</span>
          </td>

          <td>${r.p}</td>
          <td>${r.w}</td>
          <td>${r.d}</td>
          <td>${r.l}</td>
          <td>${r.gf}</td>
          <td>${r.ga}</td>
          <td>${r.gd}</td>
          <td><strong>${r.pts}</strong></td>

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
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>D</th>
                <th>L</th>
                <th>GF</th>
                <th>GA</th>
                <th>GD</th>
                <th>Pts</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

        </div>

      </section>
    `;
    }).join("");

    container.innerHTML = html;
}

/* ---------- KO ---------- */

function renderKnockoutList() {

    const container =
        getEl("koContainer");

    if (!container) return;

    const cards = [];

    (AFCON?.knockout || []).forEach(roundObj => {

        const roundName =
            roundObj.round || "KO";

        (roundObj.matches || []).forEach(m => {

            const home = m.home;
            const away = m.away;

            if (
                !teamIsKnownName(home) ||
                !teamIsKnownName(away)
            ) {
                return;
            }

            const homeName =
                teamDisplayName(home);

            const awayName =
                teamDisplayName(away);

            const hf =
                home?.iso2
                    ? (
                        TEAMS_MAP[homeName]?.flag ||
                        flagFromIso(home.iso2)
                    )
                    : "";

            const af =
                away?.iso2
                    ? (
                        TEAMS_MAP[awayName]?.flag ||
                        flagFromIso(away.iso2)
                    )
                    : "";

            const meta = [
                m.date,
                m.time
            ]
                .filter(Boolean)
                .join(" • ");

            cards.push(`
        <article class="ko-card-view">

          <div class="ko-topline">

            <div class="ko-round-title">
              ${escapeHtml(stageLabel(roundName))}
            </div>

            <div class="ko-meta-small">
              ${escapeHtml(meta)}
            </div>

          </div>

          <div class="ko-teams-line">

            <div class="ko-team-box">
              ${makeFlagHtml(hf)}
              <div class="ko-team-name">
                ${escapeHtml(homeName)}
              </div>
            </div>

            <div class="ko-vs-pill">vs</div>

            <div class="ko-team-box">
              ${makeFlagHtml(af)}
              <div class="ko-team-name">
                ${escapeHtml(awayName)}
              </div>
            </div>

          </div>

        </article>
      `);

        });

    });

    container.innerHTML =
        cards.length
            ? `<div class="ko-grid">${cards.join("")}</div>`
            : `<div class="notice">Keine KO Spiele.</div>`;
}

/* ---------- Top Scorers ---------- */

function renderTopScorers() {

    const container =
        getEl("topScorers");

    if (!container) return;

    const rows =
        (AFCON?.topScorers || [])
            .slice()
            .sort((a, b) => b.goals - a.goals)
            .map((s, i) => {

                const teamObj =
                    TEAMS_MAP[s.team];

                const flag =
                    teamObj?.flag ||
                    (
                        s.teamIso2
                            ? flagFromIso(s.teamIso2)
                            : ""
                    );

                return `
          <tr>

            <td>${i + 1}</td>

            <td>
              ${escapeHtml(s.player)}
            </td>

            <td class="teamcell">
              ${makeFlagHtml(flag)}
              <span>${escapeHtml(s.team)}</span>
            </td>

            <td>
              <strong>${s.goals}</strong>
            </td>

          </tr>
        `;
            }).join("");

    container.innerHTML = `
    <div class="table-wrap">

      <table class="table">

        <thead>
          <tr>
            <th>#</th>
            <th>Spieler</th>
            <th>Team</th>
            <th>Tore</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

    </div>
  `;
}

/* ---------- Main View ---------- */

function initAfconViewPage() {
    renderGroups();
    renderKnockoutList();
    renderTopScorers();
}

/* ---------- INIT ---------- */

document.addEventListener("DOMContentLoaded", async () => {

    loadState();

    const logoutBtn =
        getEl("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            apiLogout();
        });

    }

    // JSON laden
    await loadAfconJson();

    // Tipps Seite?
    if (getEl("koMatches")) {
        initTippsPage();
        return;
    }

    // normale WM Seite
    initAfconViewPage();

});
