import { ANLIEGEN, baueNachricht, gueltigesAnliegen, istMobilgeraet, whatsappAppLink, whatsappLink } from "./anfrage.js";

document.documentElement.classList.add("js");

const regler = document.querySelector("[data-regler]");
const ortFeld = document.querySelector("[data-ort]");
const hauptLink = document.querySelector("[data-wa-haupt]");
const waLabel = document.querySelector("[data-wa-label]");
const webLink = document.querySelector("[data-wa-web]");
const display = regler.querySelector(".display");
const displayCode = regler.querySelector("[data-display-code]");
const displayTitel = regler.querySelector("[data-display-titel]");
const displayText = regler.querySelector("[data-display-text]");
const tasten = regler.querySelectorAll("[data-anliegen]");

let gewaehlt = "sonstiges";

function aktualisiereRegler() {
  const anliegen = ANLIEGEN[gewaehlt];
  displayCode.textContent = `${anliegen.code} · NACHRICHT BEREIT`;
  displayTitel.textContent = anliegen.titel;
  displayText.textContent = baueNachricht(gewaehlt, ortFeld.value);
  hauptLink.href = whatsappLink(gewaehlt, ortFeld.value);
  webLink.href = hauptLink.href;
  waLabel.textContent = "In WhatsApp senden";
}

tasten.forEach((taste) => {
  taste.setAttribute("aria-pressed", "false");
  taste.addEventListener("click", () => {
    tasten.forEach((t) => t.setAttribute("aria-pressed", String(t === taste)));
    gewaehlt = gueltigesAnliegen(taste.dataset.anliegen);
    display.classList.remove("ist-neu");
    void display.offsetWidth;
    display.classList.add("ist-neu");
    aktualisiereRegler();
  });
});

ortFeld.addEventListener("input", () => {
  if (displayTitel.textContent !== "Was ist los?") aktualisiereRegler();
  else hauptLink.href = webLink.href = whatsappLink(gewaehlt, ortFeld.value);
});

hauptLink.href = webLink.href = whatsappLink(gewaehlt, "");

document.querySelectorAll("[data-anliegen-link]").forEach((link) => {
  link.href = whatsappLink(link.dataset.anliegenLink, "");
});

const aufHandy = istMobilgeraet(navigator.userAgent, navigator.maxTouchPoints);
// Auf dem Handy direkt die App öffnen: whatsapp:// greift auch bei WhatsApp Business, wa.me auf iOS nicht.
if (aufHandy) {
  document.addEventListener("click", (ereignis) => {
    if (ereignis.defaultPrevented || ereignis.button !== 0 || ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.altKey) return;
    const link = ereignis.target.closest("[data-wa-haupt], [data-anliegen-link]");
    if (!link) return;
    ereignis.preventDefault();
    const istHauptLink = link.hasAttribute("data-wa-haupt");
    window.location.href = whatsappAppLink(istHauptLink ? gewaehlt : link.dataset.anliegenLink, istHauptLink ? ortFeld.value : "");
  });
} else {
  webLink.hidden = true;
}

// Vorlauftemperatur pendelt leicht, damit der Regler "lebt".
const vorlauf = regler.querySelector("[data-vorlauf]");
const ruhigeBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!ruhigeBewegung) {
  let tick = 0;
  setInterval(() => {
    tick += 1;
    vorlauf.textContent = String(55 + Math.round(Math.sin(tick / 3) * 2));
  }, 1400);
}

const kopf = document.querySelector(".kopf");
window.addEventListener("scroll", () => kopf.classList.toggle("ist-gescrollt", window.scrollY > 8), { passive: true });

const beobachter = new IntersectionObserver((eintraege) => {
  eintraege.forEach((eintrag) => {
    if (!eintrag.isIntersecting) return;
    eintrag.target.classList.add("ist-sichtbar");
    beobachter.unobserve(eintrag.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".abschnitt-kopf, .typenschild li, .grosszitat, .zitate li, .leitung__station, .gebiet__raster > *, .akkordeon details, .schluss__raster > *")
  .forEach((element) => {
    element.classList.add("auftauchen");
    beobachter.observe(element);
  });
