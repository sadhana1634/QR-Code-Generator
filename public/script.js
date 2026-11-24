const form = document.getElementById("qr-form");
const input = document.getElementById("url");
const errorEl = document.getElementById("error");
const result = document.getElementById("result");
const preview = document.getElementById("preview");
const downloadPng = document.getElementById("download-png");
const downloadSvg = document.getElementById("download-svg");

const TYPING_DELAY_MS = 500;
let typingTimer;

function qrLink(url, type, download) {
  const params = new URLSearchParams({ url, type });
  if (download) params.set("download", "1");
  return `/qr?${params}`;
}

// Returns the full URL if the input looks like a complete link, otherwise null.
// "example.com" counts as complete and becomes "https://example.com".
function completeUrl(value) {
  let text = value.trim();
  if (!text) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) text = `https://${text}`;

  try {
    const { protocol, hostname } = new URL(text);
    if (protocol !== "http:" && protocol !== "https:") return text; // mailto:, tel:, etc.
    const hasTld = /\.[a-z]{2,}$/i.test(hostname);
    return hasTld || hostname === "localhost" ? text : null;
  } catch {
    return null;
  }
}

function showPreview(url) {
  errorEl.textContent = "";
  preview.src = qrLink(url, "svg");
  downloadPng.href = qrLink(url, "png", true);
  downloadSvg.href = qrLink(url, "svg", true);
  result.hidden = false;
}

// Preview automatically once the user stops typing a complete link
input.addEventListener("input", () => {
  clearTimeout(typingTimer);
  errorEl.textContent = "";
  const url = completeUrl(input.value);
  if (!url) {
    result.hidden = true; // never show a QR code for a stale or partial URL
    return;
  }
  typingTimer = setTimeout(() => showPreview(url), TYPING_DELAY_MS);
});

// Pressing Enter previews right away, or explains what's wrong
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearTimeout(typingTimer);
  const url = completeUrl(input.value);
  if (url) {
    showPreview(url);
  } else {
    result.hidden = true;
    errorEl.textContent = input.value.trim()
      ? "Please enter a complete link, e.g. example.com"
      : "Please enter a URL.";
  }
});
