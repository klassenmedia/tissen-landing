import { test } from "node:test";
import assert from "node:assert/strict";
import { baueNachricht, whatsappLink, bereinigeOrt, ANLIEGEN } from "../assets/anfrage.js";

test("Nachricht enthält Anliegen und Ort", () => {
  const text = baueNachricht("heizung-kalt", "Löhne");
  assert.match(text, /Heizung/);
  assert.match(text, /Löhne/);
});

test("Nachricht ohne Ort bittet nicht um leeren Ort", () => {
  const text = baueNachricht("bad", "");
  assert.doesNotMatch(text, /Ort: *$/m);
});

test("unbekanntes Anliegen fällt auf allgemeine Anfrage zurück", () => {
  assert.equal(baueNachricht("<script>", ""), baueNachricht("sonstiges", ""));
});

test("WhatsApp-Link ist korrekt kodiert und zielt auf die Firmennummer", () => {
  const link = new URL(whatsappLink("heizung-kalt", "Bad Oeynhausen & Umgebung"));
  assert.equal(link.origin, "https://wa.me");
  assert.equal(link.pathname, "/491702389177");
  assert.match(link.searchParams.get("text"), /Bad Oeynhausen & Umgebung/);
});

test("Ort wird gekürzt und von Steuerzeichen befreit", () => {
  assert.equal(bereinigeOrt("  Vlotho\n\u0000 "), "Vlotho");
  assert.equal(bereinigeOrt("x".repeat(500)).length, 60);
  assert.equal(bereinigeOrt(undefined), "");
});

test("jedes Anliegen hat Titel und Nachrichtentext", () => {
  for (const [schluessel, anliegen] of Object.entries(ANLIEGEN)) {
    assert.ok(anliegen.titel, schluessel);
    assert.ok(anliegen.satz, schluessel);
  }
});

test("Prototyp-Schlüssel fallen auf allgemeine Anfrage zurück", () => {
  for (const schluessel of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
    assert.equal(baueNachricht(schluessel, ""), baueNachricht("sonstiges", ""), schluessel);
  }
});

test("Emoji am Längenlimit und einzelne Surrogate brechen den Link nicht", () => {
  assert.doesNotThrow(() => whatsappLink("bad", "x".repeat(59) + "😀"));
  assert.doesNotThrow(() => whatsappLink("bad", "a\uD800"));
});

test("Richtungs- und unsichtbare Zeichen werden entfernt", () => {
  assert.equal(bereinigeOrt("Lö‮hne​ "), "Löhne");
});

test("Skripte nutzen keine HTML-Sinks", async () => {
  const { readFile } = await import("node:fs/promises");
  for (const datei of ["assets/main.js", "assets/anfrage.js"]) {
    const quelltext = await readFile(new URL(`../${datei}`, import.meta.url), "utf8");
    assert.doesNotMatch(quelltext, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, datei);
  }
});
