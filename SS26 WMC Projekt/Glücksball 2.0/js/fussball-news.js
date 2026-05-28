console.log("fussball-news.js geladen");

function newsEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNewsDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("de-DE");
}

function sectionIcon(key) {
  const icons = {
    nachrichten: "N",
    spiele: "S",
    videos: "V",
    bilder: "B",
    links: "L"
  };
  return icons[key] || "F";
}

function sectionTitle(key) {
  const titles = {
    nachrichten: "Nachrichten",
    spiele: "Spiele",
    videos: "Videos",
    bilder: "Bilder",
    links: "Links"
  };
  return titles[key] || "Fußball";
}

function flattenNewsSections(data) {
  const sections = data.sections || {};
  return Object.entries(sections)
    .flatMap(([section, items]) => (items || []).map(item => ({ ...item, section })))
    .sort((a, b) => {
      const ad = Date.parse(a.date || "") || 0;
      const bd = Date.parse(b.date || "") || 0;
      return bd - ad;
    });
}

function renderMixedFootballFeed(items) {
  const grid = document.getElementById("footballNewsGrid");
  const status = document.getElementById("footballNewsStatus");
  if (!grid || !status) return;

  status.textContent = `Gemischter Fußball-Feed - ${items.length} Beiträge`;

  if (items.length === 0) {
    grid.innerHTML = `<div class="notice">Keine Fußball-News gefunden.</div>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const dateText = formatNewsDate(item.date);
    const host = (() => {
      try { return new URL(item.link).hostname.replace(/^www\./, ""); }
      catch { return item.source || "Fußball-News"; }
    })();
    return `
      <article class="football-news-card">
        <div class="football-news-card-head">
          <div class="football-news-avatar">${newsEscape(sectionIcon(item.section))}</div>
          <div>
            <strong>${newsEscape(item.source || sectionTitle(item.section))}</strong>
            <div class="small">${newsEscape(sectionTitle(item.section))} - ${newsEscape(host)}${dateText ? " - " + newsEscape(dateText) : ""}</div>
          </div>
        </div>

        <div class="football-news-actions" aria-hidden="true">
          <span>Like</span>
          <span>Kommentar</span>
          <span>Teilen</span>
        </div>

        <h2>${newsEscape(item.title)}</h2>
        ${item.summary ? `<p class="football-news-summary">${newsEscape(item.summary)}</p>` : ""}
        <a class="football-news-link" href="${newsEscape(item.link)}" target="_blank" rel="noopener">Beitrag öffnen</a>
      </article>
    `;
  }).join("");
}

async function loadFootballNewsHub() {
  const status = document.getElementById("footballNewsStatus");
  const grid = document.getElementById("footballNewsGrid");
  if (!status || !grid) return;

  status.textContent = "Lade Fußball-News...";
  grid.innerHTML = "";

  try {
    const res = await fetch("api/fussball_news.php", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "News konnten nicht geladen werden.");

    renderMixedFootballFeed(flattenNewsSections(data));
  } catch (err) {
    console.error("Fußball-News Fehler:", err);
    status.textContent = "Fußball-News konnten nicht geladen werden.";
  }
}

document.addEventListener("DOMContentLoaded", loadFootballNewsHub);
