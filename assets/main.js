import { ANLIEGEN, baueNachricht, gueltigesAnliegen, gueltigesDetail, istMobilgeraet, whatsappAppLink, whatsappLink, whatsappZiel } from "./anfrage.js";
import { baueKontaktText, mailtoLink, pruefeKontakt } from "./kontakt.js";

const regler = document.querySelector("[data-regler]");
const ortFeld = regler.querySelector("[data-ort]");
const hauptLink = regler.querySelector("[data-wa-haupt]");
const webLink = regler.querySelector("[data-wa-web]");
const waLabel = regler.querySelector("[data-wa-label]");
const display = regler.querySelector(".display");
const displayCode = regler.querySelector("[data-display-code]");
const displayTitel = regler.querySelector("[data-display-titel]");
const displayText = regler.querySelector("[data-display-text]");
const tasten = regler.querySelectorAll("[data-anliegen]");
const detailFeld = regler.querySelector("[data-detail]");
const detailFrage = regler.querySelector("[data-detail-frage]");
const detailChips = regler.querySelector("[data-detail-chips]");

const aufHandy = istMobilgeraet(navigator.userAgent, navigator.maxTouchPoints);
let gewaehlt = "sonstiges";
let detail = "";
let schonGewaehlt = false;

function aktualisiereLinks() {
  hauptLink.href = webLink.href = whatsappLink(gewaehlt, ortFeld.value, detail);
}

function aktualisiereDisplay() {
  const anliegen = ANLIEGEN[gewaehlt];
  displayCode.textContent = "NACHRICHT BEREIT";
  displayTitel.textContent = anliegen.titel;
  displayText.textContent = baueNachricht(gewaehlt, ortFeld.value, detail);
  waLabel.textContent = "In WhatsApp senden";
}

function zeigeDetailFrage() {
  const frage = ANLIEGEN[gewaehlt].detail;
  detailChips.replaceChildren();
  detailFeld.hidden = !frage;
  if (!frage) return;
  detailFrage.textContent = `${frage.frage} (optional)`;
  for (const antwort of frage.antworten) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = antwort;
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", () => {
      const abwaehlen = detail === antwort;
      detail = abwaehlen ? "" : gueltigesDetail(gewaehlt, antwort);
      detailChips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(!abwaehlen && c === chip)));
      aktualisiereDisplay();
      aktualisiereLinks();
    });
    detailChips.append(chip);
  }
}

tasten.forEach((taste) => {
  taste.setAttribute("aria-pressed", "false");
  taste.addEventListener("click", () => {
    tasten.forEach((t) => t.setAttribute("aria-pressed", String(t === taste)));
    gewaehlt = gueltigesAnliegen(taste.dataset.anliegen);
    detail = "";
    schonGewaehlt = true;
    display.classList.remove("ist-neu");
    void display.offsetWidth;
    display.classList.add("ist-neu");
    zeigeDetailFrage();
    aktualisiereDisplay();
    aktualisiereLinks();
  });
});

ortFeld.addEventListener("input", () => {
  if (schonGewaehlt) aktualisiereDisplay();
  aktualisiereLinks();
});

aktualisiereLinks();
document.querySelectorAll("[data-anliegen-link]").forEach((link) => {
  link.href = whatsappLink(link.dataset.anliegenLink, "");
});

function oeffneLink(ziel) {
  if (aufHandy) window.location.href = ziel;
  else window.open(ziel, "_blank", "noopener");
}

// Auf dem Handy direkt die App öffnen: whatsapp:// greift auch bei WhatsApp Business, wa.me auf iOS nicht.
if (aufHandy) {
  document.addEventListener("click", (ereignis) => {
    if (ereignis.defaultPrevented || ereignis.button !== 0 || ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.altKey) return;
    const link = ereignis.target.closest("[data-wa-haupt], [data-anliegen-link]");
    if (!link) return;
    ereignis.preventDefault();
    window.location.href = link.hasAttribute("data-wa-haupt")
      ? whatsappAppLink(gewaehlt, ortFeld.value, detail)
      : whatsappAppLink(link.dataset.anliegenLink, "");
  });
} else {
  webLink.hidden = true;
}

const formular = document.querySelector("[data-kontakt]");
const fehlerAnzeige = formular.querySelector("[data-fehler]");

formular.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  const felder = formular.elements;
  const daten = {
    name: felder.name.value,
    ort: felder.ort.value,
    telefon: felder.telefon.value,
    email: felder.email.value,
    anliegen: felder.anliegen.value,
    nachricht: felder.nachricht.value,
    rueckruf: felder.rueckruf.checked,
  };
  const fehler = pruefeKontakt(daten);
  for (const feld of ["name", "telefon", "email", "nachricht"]) {
    felder[feld].toggleAttribute("aria-invalid", Boolean(fehler[feld]));
  }
  const meldungen = Object.values(fehler);
  fehlerAnzeige.textContent = meldungen.join(" ");
  if (meldungen.length) {
    felder[Object.keys(fehler)[0]].focus();
    return;
  }
  const perEmail = ereignis.submitter?.value === "email";
  if (perEmail) {
    window.location.href = mailtoLink(daten);
    return;
  }
  oeffneLink(whatsappZiel(baueKontaktText(daten), aufHandy));
});

// Vorlauftemperatur pendelt leicht, damit der Regler "lebt".
const vorlauf = regler.querySelector("[data-vorlauf]");
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let tick = 0;
  setInterval(() => {
    tick += 1;
    vorlauf.textContent = String(55 + Math.round(Math.sin(tick / 3) * 2));
  }, 1400);
}

const kopf = document.querySelector(".kopf");
window.addEventListener("scroll", () => kopf.classList.toggle("ist-gescrollt", window.scrollY > 8), { passive: true });
