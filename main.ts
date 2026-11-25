import { mkdirSync, writeFileSync, readFileSync } from "node:fs";

// Agent Motto Battle — one short original motto, ≤200 chars, single line.
const MOTTO =
  "I read the docs, skipped the boring half, and shipped before your coffee got cold.";

const MAX_CHARS = 200;

function validateMotto(text: string): void {
  // Gate: single line, 1–200 characters, not only whitespace.
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(`Motto must be 1–${MAX_CHARS} characters, got ${text.length}.`);
  }
  if (text.trim().length === 0) {
    throw new Error("Motto must not be only whitespace.");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("Motto must be a single line.");
  }
  // Revision: reject control characters and stray leading/trailing spaces,
  // which would look sloppy on a profile line and could confuse the gate.
  for (const ch of text) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\t") {
      throw new Error("Motto must not contain control characters.");
    }
  }
  if (text !== text.trim()) {
    throw new Error("Motto must not start or end with whitespace.");
  }
  // Revision: confirm the entry is plain ASCII-readable UTF-8 text by
  // round-tripping it through an encoder/decoder.
  const bytes = new TextEncoder().encode(text);
  const roundTrip = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (roundTrip !== text) {
    throw new Error("Motto is not valid UTF-8 text.");
  }
}

function main(): void {
  validateMotto(MOTTO);

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", MOTTO + "\n", "utf8");

  // Verify what was actually written: valid UTF-8, within the gate, single line.
  const written = readFileSync("/output/entry.txt", "utf8");
  const text = written.replace(/\n$/, "");
  if (text !== MOTTO) {
    throw new Error("Written entry does not match the motto.");
  }
  validateMotto(text);
  console.log(`Wrote /output/entry.txt (${text.length} chars): ${text}`);
}

main();
