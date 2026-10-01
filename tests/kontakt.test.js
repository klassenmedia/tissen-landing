import { test } from "node:test";
import assert from "node:assert/strict";
import { pruefeKontakt, baueKontaktText, mailtoLink, KONTAKT_EMAIL } from "../assets/kontakt.js";

const gueltig = {
  name: "Maria Muster",
  telefon: "0171 2345678",
  email: "",
  ort: "Löhne",
  anliegen: "Heizung",
  nachricht: "Die Heizung macht Geräusche.",
  rueckruf: true,
};

test("vollständige Angaben sind gültig", () => {
  assert.deepEqual(pruefeKontakt(gueltig), {});
});

test("Name und Nachricht sind Pflicht", () => {
  const fehler = pruefeKontakt({ ...gueltig, name: "  ", nachricht: "" });
  assert.ok(fehler.name);
  assert.ok(fehler.nachricht);
});

test("Telefon oder E-Mail muss angegeben sein", () => {
  const fehler = pruefeKontakt({ ...gueltig, telefon: "", email: "" });
  assert.ok(fehler.telefon);
  assert.deepEqual(pruefeKontakt({ ...gueltig, telefon: "", email: "maria@example.de" }), {});
});

test("ungültige Telefonnummer und E-Mail werden abgelehnt", () => {
  assert.ok(pruefeKontakt({ ...gueltig, telefon: "ruf mich an" }).telefon);
  assert.ok(pruefeKontakt({ ...gueltig, email: "maria@" }).email);
});

test("überlange Eingaben werden abgelehnt", () => {
  assert.ok(pruefeKontakt({ ...gueltig, name: "x".repeat(81) }).name);
  assert.ok(pruefeKontakt({ ...gueltig, nachricht: "x".repeat(1501) }).nachricht);
});

test("fehlende oder falsche Felder werfen keinen Fehler", () => {
  assert.doesNotThrow(() => pruefeKontakt({}));
  assert.doesNotThrow(() => pruefeKontakt({ name: 42, nachricht: null }));
});

test("Nachrichtentext enthält alle Angaben und den Rückrufwunsch", () => {
  const text = baueKontaktText(gueltig);
  for (const teil of ["Maria Muster", "0171 2345678", "Löhne", "Heizung", "Geräusche", "Rückruf"]) {
    assert.match(text, new RegExp(teil));
  }
});

test("leere optionale Felder erscheinen nicht im Text", () => {
  const text = baueKontaktText({ ...gueltig, email: "", ort: "", rueckruf: false });
  assert.doesNotMatch(text, /E-Mail:/);
  assert.doesNotMatch(text, /Ort:/);
  assert.doesNotMatch(text, /Rückruf/);
});

test("Steuerzeichen werden aus Einzeilern entfernt", () => {
  const text = baueKontaktText({ ...gueltig, name: "Maria\r\nBcc: boese@example.com" });
  assert.match(text, /Name: Maria Bcc: boese@example\.com/);
});

test("mailto-Link geht an die Firmenadresse und lässt sich nicht umleiten", () => {
  const link = mailtoLink({ ...gueltig, name: "Maria&cc=boese@example.com", nachricht: "?bcc=x@y.de" });
  assert.ok(link.startsWith(`mailto:${KONTAKT_EMAIL}?subject=`));
  const parameter = new URLSearchParams(link.split("?").slice(1).join("?"));
  assert.deepEqual([...parameter.keys()], ["subject", "body"]);
  assert.match(parameter.get("body"), /cc=boese@example\.com/);
});

test("Betreff lässt sich über das Anliegen nicht umleiten", () => {
  const link = mailtoLink({ ...gueltig, anliegen: "x&cc=boese@example.com\r\nBcc: y@z.de" });
  const parameter = new URLSearchParams(link.split("?").slice(1).join("?"));
  assert.deepEqual([...parameter.keys()], ["subject", "body"]);
});

test("einzelne Surrogate brechen Links nicht", () => {
  assert.doesNotThrow(() => mailtoLink({ ...gueltig, name: "x\uD800", nachricht: "y\uDC00" }));
  assert.doesNotThrow(() => baueKontaktText({ ...gueltig, nachricht: "y\uD800" }));
  assert.doesNotThrow(() => encodeURIComponent(baueKontaktText({ ...gueltig, nachricht: "y\uD800" })));
});

test("unsichtbare Zeichen erfüllen keine Pflichtfelder", () => {
  const fehler = pruefeKontakt({ ...gueltig, name: "​​", nachricht: "​﻿" });
  assert.ok(fehler.name);
  assert.ok(fehler.nachricht);
});
