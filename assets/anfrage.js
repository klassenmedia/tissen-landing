export const WHATSAPP_NUMMER = "491702389177";
const MAX_ORT_LAENGE = 60;

export const ANLIEGEN = {
  "heizung-kalt": {
    titel: "Heizung kalt", code: "E-01", satz: "meine Heizung ist ausgefallen bzw. wird nicht warm.",
    detail: { frage: "Welche Heizung haben Sie?", zeile: "Heizungsart", antworten: ["Gas", "Öl", "Wärmepumpe", "Pellet", "Weiß nicht"] },
  },
  "kein-warmwasser": {
    titel: "Kein Warmwasser", code: "E-02", satz: "ich habe kein warmes Wasser mehr.",
    detail: { frage: "Wie wird Ihr Wasser warm?", zeile: "Warmwasser über", antworten: ["Über die Heizung", "Durchlauferhitzer", "Boiler", "Weiß nicht"] },
  },
  "wasserschaden": {
    titel: "Wasser tropft", code: "E-03", satz: "bei mir tropft oder läuft Wasser aus einer Leitung.",
    detail: { frage: "Wie schlimm ist es?", zeile: "Lage", antworten: ["Tropft", "Läuft stark", "Haupthahn ist zu"] },
  },
  "neue-heizung": {
    titel: "Neue Heizung", code: "P-04", satz: "ich möchte meine Heizung erneuern und brauche eine Beratung.",
    detail: { frage: "Woran denken Sie?", zeile: "Interesse", antworten: ["Wärmepumpe", "Hybrid", "Gas", "Pellet", "Noch offen"] },
  },
  "bad": {
    titel: "Neues Bad", code: "P-05", satz: "ich plane ein neues Bad bzw. eine Badsanierung.",
    detail: { frage: "Was ist geplant?", zeile: "Vorhaben", antworten: ["Komplett neu", "Barrierefrei", "Teilumbau", "Noch offen"] },
  },
  "wartung": {
    titel: "Wartung", code: "S-06", satz: "ich möchte einen Wartungstermin.",
    detail: { frage: "Was soll gewartet werden?", zeile: "Anlage", antworten: ["Heizung", "Wärmepumpe", "Solarthermie", "Lüftung/Klima"] },
  },
  "sonstiges": { titel: "Etwas anderes", code: "S-00", satz: "ich habe eine Frage zu Heizung, Sanitär oder Klima." },
};

export function bereinigeOrt(eingabe) {
  if (typeof eingabe !== "string") return "";
  const ohneSteuerzeichen = eingabe
    .toWellFormed()
    .replace(/[\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(ohneSteuerzeichen).slice(0, MAX_ORT_LAENGE).join("");
}

export function gueltigesAnliegen(schluessel) {
  return Object.hasOwn(ANLIEGEN, schluessel) ? schluessel : "sonstiges";
}

export function gueltigesDetail(schluessel, detail) {
  const antworten = ANLIEGEN[gueltigesAnliegen(schluessel)].detail?.antworten ?? [];
  return antworten.includes(detail) ? detail : "";
}

export function baueNachricht(schluessel, ort, detail = "") {
  const anliegen = ANLIEGEN[gueltigesAnliegen(schluessel)];
  const sauberOrt = bereinigeOrt(ort);
  const sauberDetail = gueltigesDetail(schluessel, detail);
  const zeilen = [`Hallo Team Tissen, ${anliegen.satz}`];
  if (sauberDetail) zeilen.push(`${anliegen.detail.zeile}: ${sauberDetail}`);
  if (sauberOrt) zeilen.push(`Ort: ${sauberOrt}`);
  zeilen.push("Ich schicke gleich noch ein Foto mit.");
  return zeilen.join("\n");
}

export function whatsappZiel(text, alsApp = false) {
  const kodiert = encodeURIComponent(text);
  return alsApp
    ? `whatsapp://send?phone=${WHATSAPP_NUMMER}&text=${kodiert}`
    : `https://wa.me/${WHATSAPP_NUMMER}?text=${kodiert}`;
}

export function whatsappLink(schluessel, ort, detail = "") {
  return whatsappZiel(baueNachricht(schluessel, ort, detail));
}

// whatsapp:// öffnet auch WhatsApp Business; wa.me-Links öffnet iOS nur mit der normalen App.
export function whatsappAppLink(schluessel, ort, detail = "") {
  return whatsappZiel(baueNachricht(schluessel, ort, detail), true);
}

export function istMobilgeraet(userAgent, maxTouchPoints) {
  const ipadMitDesktopKennung = /Macintosh/.test(userAgent) && maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod/i.test(userAgent) || ipadMitDesktopKennung;
}
