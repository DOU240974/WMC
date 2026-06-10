const state = {
    adminPassword: ""
};

const nodes = {
    form: document.getElementById("adminLoginForm"),
    password: document.getElementById("adminPassword"),
    message: document.getElementById("adminMessage"),
    list: document.getElementById("pendingUsers")
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

function renderUsers(users) {
    if (!users.length) {
        nodes.list.innerHTML = `<p style="color:var(--muted);">Keine offenen Registrierungen.</p>`;
        return;
    }

    nodes.list.innerHTML = users.map(user => `
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

async function loadPendingUsers() {
    const password = encodeURIComponent(state.adminPassword);
    const data = await api(`admin_pending_users.php?admin_password=${password}`);
    renderUsers(data.users || []);
    nodes.message.textContent = "Anfragen geladen.";
}

async function handleDecision(card, action) {
    await api("admin_approve_user.php", {
        admin_password: state.adminPassword,
        id: Number(card.dataset.id),
        source: card.dataset.source || "pending",
        action
    });
    await loadPendingUsers();
}

nodes.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    state.adminPassword = nodes.password.value;

    try {
        await loadPendingUsers();
    } catch (error) {
        nodes.message.textContent = error.message;
    }
});

nodes.list?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    const card = event.target.closest(".pending-user");
    if (!button || !card) return;

    try {
        await handleDecision(card, button.dataset.action);
    } catch (error) {
        nodes.message.textContent = error.message;
    }
});
