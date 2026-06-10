function getResetToken() {
  return new URLSearchParams(window.location.search).get("token") || "";
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("resetPasswordForm");
  const info = document.getElementById("resetInfo");
  const token = getResetToken();

  if (!form) return;

  if (!token) {
    if (info) info.textContent = "Dieser Reset-Link ist ungueltig.";
    form.style.display = "none";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("newPassword")?.value || "";
    const repeat = document.getElementById("newPasswordRepeat")?.value || "";

    if (password !== repeat) {
      alert("Die Passwoerter stimmen nicht ueberein.");
      return;
    }

    try {
      const result = await api("reset_password.php", { token, password });
      alert(result.message || "Passwort wurde gesetzt.");
      window.location.href = "tipps.html";
    } catch (err) {
      alert(err.message);
    }
  });
});
