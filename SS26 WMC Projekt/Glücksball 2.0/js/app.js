/* 1. Application State Object */
const appState = {
    loggedIn: false,
    username: "",
    theme: localStorage.getItem("theme") || "dark"
};

const HOME_TEAM_FLAGS = {
    Algeria: "dz",
    Argentina: "ar",
    Australia: "au",
    Austria: "at",
    Belgium: "be",
    "Bosnia and Herzegovina": "ba",
    Brazil: "br",
    Canada: "ca",
    Colombia: "co",
    Croatia: "hr",
    "Czech Republic": "cz",
    Ecuador: "ec",
    England: "gb-eng",
    France: "fr",
    Germany: "de",
    Japan: "jp",
    Mexico: "mx",
    Morocco: "ma",
    Netherlands: "nl",
    Paraguay: "py",
    Portugal: "pt",
    Qatar: "qa",
    Senegal: "sn",
    "Korea Republic": "kr",
    "South Korea": "kr",
    "S\u00fcdkorea": "kr",
    Spain: "es",
    Switzerland: "ch",
    Tunisia: "tn",
    Turkey: "tr",
    "United States": "us",
    Uruguay: "uy",
};
const HOME_TEAM_NAMES_DE = {
    "Bosnia and Herzegovina": "Bosnien und Herzegowina",
    Canada: "Kanada",
    "Czech Republic": "Tschechien",
    "Korea Republic": "S\u00fcdkorea",
    Paraguay: "Paraguay",
    Qatar: "Katar",
    "South Korea": "S\u00fcdkorea",
    Switzerland: "Schweiz",
    "United States": "USA"
};
/* 2. DOM Node References */
const dom = {};

function collectDomNodes() {
    dom.themeToggle = document.getElementById("themeToggle");
    dom.authArea = document.getElementById("authArea");
    dom.authToggle = document.getElementById("authToggle");
    dom.authBox = document.getElementById("authBox");
    dom.loginForm = document.getElementById("loginForm");
    dom.registerForm = document.getElementById("registerForm");
    dom.loginLed = document.getElementById("loginLed");
    dom.navUsername = document.getElementById("navUsername");
    dom.newsList = document.getElementById("nationalNews");
    dom.upcomingMatches = document.getElementById("upcomingMatches");
}

/* 3. DOM Node Creation Functions */
function createNewsItem(item) {
    const article = document.createElement("article");
    article.className = "news-item";

    const title = document.createElement("div");
    title.className = "news-item-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "news-item-meta";
    const dateText = item.date ? new Date(item.date).toLocaleDateString("de-DE") : "";
    meta.textContent = (item.source || "Turnier-News") + (dateText ? " \u00b7 " + dateText : "");

    const btn = document.createElement("a");
    btn.className = "news-item-btn";
    btn.textContent = "Artikel \u00f6ffnen";
    btn.href = item.link || "#";
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";

    article.append(title, meta, btn);
    return article;
}

function createNotice(text) {
    const notice = document.createElement("div");
    notice.className = "notice";
    notice.textContent = text;
    return notice;
}


function createMatchCard(match) {
    const card = document.createElement("article");
    card.className = "mini-card";

    const row = document.createElement("div");
    row.className = "match-row";

    row.append(
        createTeam(match.team1, "left"),
        createMatchCenter(match),
        createTeam(match.team2, "right")
    );

    card.append(row);

    if (match.venue) {
        const venue = document.createElement("div");
        venue.className = "small";
        venue.textContent = match.venue;
        card.append(venue);
    }

    return card;
}

function createTeam(teamName, side) {
    const team = document.createElement("div");
    team.className = `team ${side}`;

    const flag = document.createElement("img");
    flag.className = "flag";
    flag.alt = teamName;
    flag.src = getFlagUrl(teamName);
    flag.onerror = () => {
        flag.src = "image/flag-placeholder.png";
    };

    const name = document.createElement("span");
    name.className = "team-name";
    name.textContent = getTeamDisplayName(teamName);

    team.append(flag, name);
    return team;
}

function createMatchCenter(match) {
    const center = document.createElement("div");
    center.className = "match-center";

    const date = document.createElement("div");
    date.className = "match-date";
    date.textContent = `${formatDate(match.date)} - ${match.time}`;

    const vs = document.createElement("div");
    vs.className = "vs";
    vs.textContent = "VS";

    const badge = document.createElement("div");
    badge.className = "badge";
    badge.textContent = match.tournament;

    center.append(date, vs, badge);
    return center;
}

/* 4. Render Functions */
function renderNews(items) {
    if (!dom.newsList) return;
    if (items.length === 0) {
        dom.newsList.replaceChildren(createNotice("Keine News gefunden."));
        return;
    }
    dom.newsList.replaceChildren(...items.slice(0, 4).map(createNewsItem));
}

function renderAuth() {
    if (dom.loginLed) dom.loginLed.classList.toggle("is-on", appState.loggedIn);
    if (dom.navUsername) dom.navUsername.textContent = appState.loggedIn ? appState.username : "";
    if (dom.authToggle) dom.authToggle.textContent = appState.loggedIn ? "Logout" : "Login";
    if (dom.authBox && appState.loggedIn) dom.authBox.style.display = "none";
}

function renderUpcomingMatches(matches) {
    if (!dom.upcomingMatches) return;

    const upcoming = matches
        .map(match => ({ ...match, dateTime: new Date(`${match.date}T${match.time || "00:00"}`) }))
        .filter(match => !Number.isNaN(match.dateTime.getTime()))
        .filter(match => match.dateTime >= new Date())
        .sort((a, b) => a.dateTime - b.dateTime)
        .slice(0, 5);

    if (upcoming.length === 0) {
        dom.upcomingMatches.replaceChildren(createNotice("Keine kommenden Spiele gefunden."));
        return;
    }

    dom.upcomingMatches.replaceChildren(...upcoming.map(createMatchCard));
}

/* 5. Event Handlers */
function setupTheme() {
    applyTheme(appState.theme);
    dom.themeToggle?.addEventListener("click", () => {
        appState.theme = appState.theme === "dark" ? "light" : "dark";
        applyTheme(appState.theme);
    });
}

function goToStats(event) {
    if (!appState.loggedIn) return;
    event?.preventDefault();
    event?.stopPropagation();
    window.location.href = "statistik.html";
}
function setupAuth() {
    dom.navUsername?.addEventListener("click", goToStats);
    dom.authToggle?.addEventListener("click", async (event) => {
        event.stopPropagation();

        if (appState.loggedIn) {
            await api("logout.php", {}).catch(() => null);
            appState.loggedIn = false;
            appState.username = "";
            renderAuth();
            return;
        }

        if (dom.authBox) {
            dom.authBox.style.display = dom.authBox.style.display === "block" ? "none" : "block";
        }
    });

    dom.authArea?.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("click", () => {
        if (dom.authBox) dom.authBox.style.display = "none";
    });
}

function setupLoginForm() {
    dom.loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("loginName")?.value.trim();
        const password = document.getElementById("loginPass")?.value;

        try {
            await api("login.php", { username, password });
            await loadSession();
            dom.loginForm.reset();
            renderAuth();
        } catch (error) {
            alert(error.message);
        }
    });
}

function setupRegisterForm() {
    dom.registerForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("regName")?.value.trim();
        const email = document.getElementById("regEmail")?.value.trim();
        const password = document.getElementById("regPass")?.value;

        try {
            const result = await api("register.php", { username, email, password });
            dom.registerForm.reset();
            alert(result.message || "Registrierung gespeichert.");
        } catch (error) {
            alert(error.message);
        }
    });
}

/* 6. Initialization Bindings */
async function api(path, data) {
    const response = await fetch(`api/${path}`, {
        method: data ? "POST" : "GET",
        headers: data ? { "Content-Type": "application/json" } : undefined,
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
        cache: "no-store"
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
        throw new Error(result.error || "Serverfehler");
    }
    return result;
}

async function loadSession() {
    try {
        const me = await api("me.php");
        appState.loggedIn = Boolean(me.loggedIn || me.logged_in || me.username);
        appState.username = me.username || "";
    } catch {
        appState.loggedIn = false;
        appState.username = "";
    }
}

async function loadNews() {
    if (!dom.newsList) return;
    dom.newsList.replaceChildren(createNotice("Lade News..."));

    try {
        const data = await api("fussball_news.php");
        const items = [...(data.sections?.nachrichten || []), ...(data.sections?.links || [])];
        renderNews(items);
    } catch {
        dom.newsList.replaceChildren(createNotice("News konnten nicht geladen werden."));
    }
}

async function loadUpcomingMatches() {
    if (!dom.upcomingMatches) return;
    dom.upcomingMatches.replaceChildren(createNotice("Lade kommende Spiele..."));

    try {
        const data = await api("upcoming_matches.php");
        const matches = (data.matches || []).map(match => {
            const [date, timeWithSeconds = "00:00:00"] = String(match.date || "").split(" ");
            return {
                team1: match.team_home || "Team A",
                team2: match.team_away || "Team B",
                date,
                time: timeWithSeconds.slice(0, 5),
                tournament: match.competition || "WM 2026",
                venue: /^tbd$/i.test(String(match.venue || "")) ? "" : String(match.venue || "")
            };
        });
        renderUpcomingMatches(matches);
    } catch (error) {
        dom.upcomingMatches.replaceChildren(createNotice("Spiele konnten nicht geladen werden."));
    }
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (dom.themeToggle) {
        dom.themeToggle.textContent = theme === "dark" ? "Lightmode" : "Darkmode";
        dom.themeToggle.title = theme === "dark" ? "Zum Lightmode wechseln" : "Zum Darkmode wechseln";
    }
}

function formatDate(value) {
    if (!value) return "offen";
    return new Date(value).toLocaleDateString("de-DE");
}

function getTeamDisplayName(teamName) {
    return HOME_TEAM_NAMES_DE[String(teamName || '').trim()] || teamName;
}

function getFlagUrl(teamName) {
    const code = HOME_TEAM_FLAGS[String(teamName || "").trim()];
    return code ? `https://flagcdn.com/w20/${code}.png` : "image/flag-placeholder.png";
}

/* 7. Initial Render */
document.addEventListener("DOMContentLoaded", async () => {
    collectDomNodes();
    setupTheme();
    setupAuth();
    setupLoginForm();
    setupRegisterForm();

    await loadSession();
    renderAuth();
    loadUpcomingMatches();
    loadNews();
});






