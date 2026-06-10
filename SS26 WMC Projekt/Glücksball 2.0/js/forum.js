function forumEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function forumDate(value) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function forumApi(payload) {
  const res = await fetch("api/forum_messages.php", {
    method: payload ? "POST" : "GET",
    headers: payload ? { "Content-Type": "application/json" } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    credentials: "include",
    cache: "no-store"
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || "Forum konnte nicht geladen werden.");
  return data;
}

function renderForumMessages(messages) {
  const wrap = document.getElementById("forumMessages");
  if (!wrap) return;

  wrap.innerHTML = (messages || []).map(message => {
    const likes = Number(message.likes ?? 0);
    const dislikes = Number(message.dislikes ?? 0);
    const myReaction = String(message.my_reaction || "");

    return `
    <article class="forum-message" data-message-id="${forumEscape(message.id)}">
      <div class="forum-message-head">
        <strong>${forumEscape(message.username)}</strong>
        <span>${forumEscape(forumDate(message.created_at))}</span>
      </div>
      <p>${forumEscape(message.message)}</p>
      <div class="forum-reactions">
        <button class="forum-reaction ${myReaction === "like" ? "active" : ""}" type="button" data-reaction="like" data-message-id="${forumEscape(message.id)}">
          Like <strong>${likes}</strong>
        </button>
        <button class="forum-reaction ${myReaction === "dislike" ? "active" : ""}" type="button" data-reaction="dislike" data-message-id="${forumEscape(message.id)}">
          Dislike <strong>${dislikes}</strong>
        </button>
      </div>
    </article>
  `;
  }).join("") || `<div class="notice">Noch keine Nachrichten.</div>`;

  wrap.scrollTop = wrap.scrollHeight;
}

async function loadForumMessages() {
  const status = document.getElementById("forumStatus");
  const input = document.getElementById("forumInput");
  const form = document.getElementById("forumForm");

  try {
    const data = await forumApi();
    renderForumMessages(data.messages || []);
    if (status) status.textContent = data.loggedIn
      ? `Eingeloggt als ${data.username}`
      : "Zum Schreiben bitte einloggen.";
    if (input) input.disabled = !data.loggedIn;
    if (form) form.querySelector("button")?.toggleAttribute("disabled", !data.loggedIn);
  } catch (err) {
    if (status) status.textContent = err.message;
  }
}

async function sendForumMessage(event) {
  event.preventDefault();
  const input = document.getElementById("forumInput");
  const button = event.currentTarget.querySelector("button");
  const text = input?.value.trim() || "";
  if (!text) return;

  if (button) button.disabled = true;
  try {
    await forumApi({ message: text });
    if (input) input.value = "";
    await loadForumMessages();
  } catch (err) {
    alert(err.message);
  } finally {
    if (button) button.disabled = false;
  }
}

async function voteForumMessage(event) {
  const button = event.target.closest("[data-reaction][data-message-id]");
  if (!button) return;

  const messageId = Number(button.getAttribute("data-message-id") || "0");
  const reaction = button.getAttribute("data-reaction");
  if (!messageId || !reaction) return;

  button.disabled = true;
  try {
    await forumApi({ message_id: messageId, reaction });
    await loadForumMessages();
  } catch (err) {
    alert(err.message);
  } finally {
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("forumForm")?.addEventListener("submit", sendForumMessage);
  document.getElementById("forumRefresh")?.addEventListener("click", loadForumMessages);
  document.getElementById("forumMessages")?.addEventListener("click", voteForumMessage);
  loadForumMessages();
  setInterval(loadForumMessages, 15000);
});
