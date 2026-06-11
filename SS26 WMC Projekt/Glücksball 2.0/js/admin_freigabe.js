const state = {
    // Admin-Passwort wird nur im Browser-Zustand gehalten und bei jedem Admin-API-Aufruf mitgeschickt.
    adminPassword: ""
};

const nodes = {
    form: document.getElementById("adminLoginForm"),
    password: document.getElementById("adminPassword"),
    message: document.getElementById("adminMessage"),
    panel: document.getElementById("adminPanel"),
    pendingList: document.getElementById("pendingUsers"),
    activeList: document.getElementById("activeUsers")
};

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function api(path, data) {
    const options = data
        ? {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        }
        : { credentials: "include" };

    const response = await fetch(`api/${path}`, options);
    const json = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(json.error || "Fehler");
    return json;
}

function renderPendingUsers(users) {
    // Offene Registrierungen: diese User sind noch nicht in der normalen users-Tabelle aktiv.
    if (!users.length) {
        nodes.pendingList.innerHTML = `<p style="color:var(--muted);">Keine offenen Registrierungen.</p>`;
        return;
    }

    nodes.pendingList.innerHTML = users.map(user => `
        <article class="mini-card pending-user" data-id="${escapeHtml(user.id)}" data-source="${escapeHtml(user.source || "pending")}">
            <h3>${escapeHtml(user.username)}</h3>
            <p>${escapeHtml(user.email || "Keine E-Mail")}</p>
            <p style="color:var(--muted);">${escapeHtml(user.source === "user" ? "Alter Account ohne Freigabe" : "Neue Registrierung")}</p>
            <p style="color:var(--muted);">${escapeHtml(user.created_at)}</p>
            <div class="actions">
                <button class="btn" data-action="approve" type="button">Freigeben</button>
                <button class="btn btn-ghost" data-action="reject" type="button">Ablehnen</button>
            </div>
        </article>
    `).join("");
}

function renderActiveUsers(users) {
    // Aktive User können hier wieder gesperrt werden. Dabei bleibt der Account erhalten.
    if (!users.length) {
        nodes.activeList.innerHTML = `<p style="color:var(--muted);">Keine aktiven User.</p>`;
        return;
    }

    nodes.activeList.innerHTML = users.map(user => `
        <article class="mini-card pending-user" data-id="${escapeHtml(user.id)}" data-source="user">
            <h3>${escapeHtml(user.username)}</h3>
            <p>${escapeHtml(user.email || "Keine E-Mail")}</p>
            <p style="color:var(--muted);">Aktiv seit ${escapeHtml(user.created_at || "-")}</p>
            <div class="actions">
                <button class="btn btn-danger" data-action="suspend" type="button">Sperren</button>
            </div>
        </article>
    `).join("");
}

async function loadAdminUsers() {
    // Erst nach erfolgreichem Passwort-Check zeigt die Seite den eigentlichen Verwaltungsbereich.
    const password = encodeURIComponent(state.adminPassword);
    const data = await api(`admin_pending_users.php?admin_password=${password}`);
    renderPendingUsers(data.users || []);
    renderActiveUsers(data.active_users || []);
    if (nodes.panel) nodes.panel.style.display = "block";
    nodes.message.textContent = "Admin-Bereich geladen.";
}

async function handleDecision(card, action) {
    // action ist approve, reject oder suspend und wird zentral an die Admin-API gesendet.
    await api("admin_approve_user.php", {
        admin_password: state.adminPassword,
        id: Number(card.dataset.id),
        source: card.dataset.source || "pending",
        action
    });
    await loadAdminUsers();
}

nodes.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.adminPassword = nodes.password.value;

    try {
        await loadAdminUsers();
    } catch (error) {
        if (nodes.panel) nodes.panel.style.display = "none";
        nodes.message.textContent = error.message;
    }
});

nodes.panel?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    const card = event.target.closest(".pending-user");
    if (!button || !card) return;

    if (button.dataset.action === "suspend" && !confirm("Diesen User wirklich sperren?")) return;

    try {
        await handleDecision(card, button.dataset.action);
    } catch (error) {
        nodes.message.textContent = error.message;
    }
});
