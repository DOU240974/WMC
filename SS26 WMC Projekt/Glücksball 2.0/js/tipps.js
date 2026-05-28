console.log("tipps.js geladen ✅");

// =========================================================
// KONFIG: Passe diese Selektoren nur an, wenn nötig
// =========================================================

// 1) Jede KO-Card sollte idealerweise ein data-match-id haben:
// <div class="ko-card" data-match-id="QF1">
const CARD_SELECTOR = ".ko-card, [data-match-id]";

// 2) Save-Button in der Card (passe ggf. an)
const SAVE_BTN_SELECTOR = "button.save-bet, button[data-action='save-bet'], button.ko-save, .save-bet";

// 3) Inputs für Tore (passe ggf. an)
const HOME_INPUT_SELECTOR = "input[name='pred_home'], input.pred-home, input.home, .pred-home input, .home input";
const AWAY_INPUT_SELECTOR = "input[name='pred_away'], input.pred-away, input.away, .pred-away input, .away input";

// 4) Alternative Stelle, wo match_id stehen könnte (z.B. hidden input)
const MATCH_HIDDEN_SELECTOR = "input[name='match_id'], input.match-id";

// =========================================================
// API helper
// =========================================================
async function apiPost(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let json = null;
  try { json = await res.json(); }
  catch { json = { ok: false, error: "Server antwortet nicht mit JSON", status: res.status }; }

  return json;
}

// =========================================================
// Match-ID aus Card holen (robust)
// =========================================================
function getMatchIdFromCard(card) {
  if (!card) return "";

  // 1) Best Case: data-match-id
  const ds = card.dataset?.matchId;
  if (ds) return String(ds).trim();

  // 2) Hidden input <input name="match_id" value="QF1">
  const hidden = card.querySelector(MATCH_HIDDEN_SELECTOR);
  if (hidden && hidden.value) return String(hidden.value).trim();

  // 3) Versuch: irgendwo im Text steht sowas wie "QF1" (Notlösung)
  const txt = (card.textContent || "").match(/\bQF[1-9]\d?\b/);
  if (txt && txt[0]) return txt[0];

  return "";
}

// =========================================================
// Save Handler
// =========================================================
async function saveBet(card) {
  const matchId = getMatchIdFromCard(card);

  if (!matchId) {
    alert("❌ match_id fehlt im HTML. Füge data-match-id='QF1' zur Card hinzu.");
    console.error("match_id missing: card=", card);
    return;
  }

  const homeInput = card.querySelector(HOME_INPUT_SELECTOR);
  const awayInput = card.querySelector(AWAY_INPUT_SELECTOR);

  if (!homeInput || !awayInput) {
    alert("❌ Tore-Inputs nicht gefunden. Prüfe HOME_INPUT_SELECTOR / AWAY_INPUT_SELECTOR in tipps.js");
    console.error("inputs missing", { homeInput, awayInput, card });
    return;
  }

  const predHome = homeInput.value;
  const predAway = awayInput.value;

  // Debug in Konsole
  console.log("SEND -> place_bet.php", { match_id: matchId, pred_home: predHome, pred_away: predAway });

  const json = await apiPost("api/place_bet.php", {
    match_id: matchId,
    pred_home: predHome,
    pred_away: predAway,
  });

  if (json.ok) {
    alert("✅ Tipp gespeichert");
    card.classList.add("is-tipped");
  } else {
    alert(json.error || "❌ Fehler beim Speichern");
    console.error("save error", json);
  }
}

// =========================================================
// Click Binding (Event Delegation)
// =========================================================
document.addEventListener("click", (e) => {
  const btn = e.target.closest(SAVE_BTN_SELECTOR);
  if (!btn) return;

  const card = btn.closest(CARD_SELECTOR);
  if (!card) {
    alert("❌ KO-Card nicht gefunden (Selector CARD_SELECTOR anpassen)");
    return;
  }

  e.preventDefault();
  saveBet(card);
});
