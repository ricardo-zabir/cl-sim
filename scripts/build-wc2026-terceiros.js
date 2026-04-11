#!/usr/bin/env node
/**
 * Lê src/terceiros.txt e gera src/wc2026TerceirosPorElim.js
 * Uso: node scripts/build-wc2026-terceiros.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "src", "terceiros.txt");
const out = path.join(root, "src", "wc2026TerceirosPorElim.js");

const lines = fs.readFileSync(src, "utf8").trim().split(/\n/);
const grupos = "ABCDEFGHIJKL".split("");
const map = {};

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].trim().split(/\s+/).filter(Boolean);
  const last8 = parts.slice(-8).map((t) => t[1]);
  const qual = new Set(last8);
  const key = grupos.filter((g) => !qual.has(g)).sort().join("");
  map[key] = last8;
}

const header = `// Gerado por scripts/build-wc2026-terceiros.js a partir de src/terceiros.txt\n`;
fs.writeFileSync(
  out,
  `${header}export const WC2026_TERCEIROS_POR_ELIM = ${JSON.stringify(map)};\n`
);
console.log("OK:", out, Object.keys(map).length, "cenários");
