import { bereinigeOrt } from "./anfrage.js";

export const KONTAKT_EMAIL = "info@gebaeudetechnik-tissen.de";
const MAX_NAME = 80;
const MAX_NACHRICHT = 1500;
const TELEFON_MUSTER = /^\+?[0-9 ()/-]{6,25}$/;
const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const UNSICHTBARE_ZEICHEN = /[\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g;

// toWellFormed verhindert, dass encodeURIComponent an einzelnen Surrogaten scheitert.
function alsText(wert) {
  return typeof wert === "string" ? wert.toWellFormed().replace(UNSICHTBARE_ZEICHEN, "").trim() : "";
}

function einzeiler(wert) {
  return alsText(wert)
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pruefeKontakt(daten) {
  const fehler = {};
  const name = alsText(daten.name);
  const telefon = alsText(daten.telefon);
  const email = alsText(daten.email);
  const nachricht = alsText(daten.nachricht);

  if (!name) fehler.name = "Bitte Ihren Namen angeben.";
  else if (name.length > MAX_NAME) fehler.name = `Bitte höchstens ${MAX_NAME} Zeichen.`;

  if (!telefon && !email) fehler.telefon = "Bitte Telefon oder E-Mail angeben, damit wir antworten können.";
  if (telefon && !TELEFON_MUSTER.test(telefon)) fehler.telefon = "Bitte eine gültige Telefonnummer angeben.";
  if (email && !EMAIL_MUSTER.test(email)) fehler.email = "Bitte eine gültige E-Mail-Adresse angeben.";

  if (!nachricht) fehler.nachricht = "Bitte kurz beschreiben, worum es geht.";
  else if (nachricht.length > MAX_NACHRICHT) fehler.nachricht = `Bitte höchstens ${MAX_NACHRICHT} Zeichen.`;

  return fehler;
}

export function baueKontaktText(daten) {
  const zeilen = ["Hallo Team Tissen,", "", alsText(daten.nachricht), ""];
  const angaben = [
    ["Anliegen", einzeiler(daten.anliegen)],
    ["Name", einzeiler(daten.name)],
    ["Telefon", einzeiler(daten.telefon)],
    ["E-Mail", einzeiler(daten.email)],
    ["Ort", bereinigeOrt(daten.ort)],
  ];
  for (const [bezeichnung, wert] of angaben) {
    if (wert) zeilen.push(`${bezeichnung}: ${wert}`);
  }
  if (daten.rueckruf === true) zeilen.push("Rückruf erwünscht.");
  return zeilen.join("\n");
}

export function mailtoLink(daten) {
  const betreff = `Anfrage über die Website: ${einzeiler(daten.anliegen) || "Allgemein"}`;
  return `mailto:${KONTAKT_EMAIL}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(baueKontaktText(daten))}`;
}
