export const WHATSAPP_NUMMER = "491702389177";
const MAX_ORT_LAENGE = 60;

export const ANLIEGEN = {
  "heizung-kalt": { titel: "Heizung kalt", code: "E-01", satz: "meine Heizung ist ausgefallen bzw. wird nicht warm." },
  "kein-warmwasser": { titel: "Kein Warmwasser", code: "E-02", satz: "ich habe kein warmes Wasser mehr." },
  "wasserschaden": { titel: "Wasser tropft", code: "E-03", satz: "bei mir tropft oder läuft Wasser aus einer Leitung." },
  "waermepumpe": { titel: "Neue Heizung", code: "P-04", satz: "ich möchte meine Heizung erneuern und interessiere mich für eine Wärmepumpe oder Hybridlösung." },
  "bad": { titel: "Neues Bad", code: "P-05", satz: "ich plane ein neues Bad bzw. eine Badsanierung." },
  "wartung": { titel: "Wartung", code: "S-06", satz: "ich möchte einen Wartungstermin für meine Heizung." },
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

export function baueNachricht(schluessel, ort) {
  const anliegen = ANLIEGEN[gueltigesAnliegen(schluessel)];
  const sauberOrt = bereinigeOrt(ort);
  const zeilen = [`Hallo Team Tissen, ${anliegen.satz}`];
  if (sauberOrt) zeilen.push(`Ort: ${sauberOrt}`);
  zeilen.push("Ich schicke gleich noch ein Foto mit.");
  return zeilen.join("\n");
}

export function whatsappLink(schluessel, ort) {
  return `https://wa.me/${WHATSAPP_NUMMER}?text=${encodeURIComponent(baueNachricht(schluessel, ort))}`;
}

// whatsapp:// öffnet auch WhatsApp Business; wa.me-Links öffnet iOS nur mit der normalen App.
export function whatsappAppLink(schluessel, ort) {
  return `whatsapp://send?phone=${WHATSAPP_NUMMER}&text=${encodeURIComponent(baueNachricht(schluessel, ort))}`;
}

export function istMobilgeraet(userAgent, maxTouchPoints) {
  const ipadMitDesktopKennung = /Macintosh/.test(userAgent) && maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod/i.test(userAgent) || ipadMitDesktopKennung;
}
