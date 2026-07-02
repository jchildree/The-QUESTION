#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const vaultDir = path.join(
  __dirname,
  "fixture",
  "docs",
  "Obsidian Vault",
  "The Question"
);

function fail(msg) {
  console.error("FAIL: " + msg);
  process.exit(1);
}

if (!fs.existsSync(vaultDir)) fail("vault dir missing: " + vaultDir);
const files = fs.readdirSync(vaultDir).filter((f) => f.endsWith(".md"));
if (files.length === 0) fail("no board notes in " + vaultDir);

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return fields;
}

const LADDER = ["unverified", "corroborated", "verified"];
let hypotheses = 0;
let verified = 0;

for (const f of files) {
  const fm = frontmatter(
    fs.readFileSync(path.join(vaultDir, f), "utf8").replace(/^\uFEFF/, "")
  );
  if (!fm || !fm.id) continue;
  if (!/^spiffe:\/\/[^/]+\/[^/]+\/[^/]+\/[^/]+$/.test(fm.id))
    fail(
      f + ": id is not a spiffe://<domain>/<case>/<kind>/<slug> URI: " + fm.id
    );
  if (!fm.confidence) fail(f + ": provenance node missing confidence field");
  if (fm.confidence && !LADDER.includes(fm.confidence))
    fail(f + ": confidence not on the ladder: " + fm.confidence);
  if (/\/hypothesis\//.test(fm.id)) hypotheses += 1;
  if (fm.confidence === "verified") {
    if (!fm.verify)
      fail(f + ": verified node without verify (no verify, no green)");
    verified += 1;
  }
}

if (hypotheses === 0)
  fail("no hypothesis nodes emitted (Phase 3 emit missing)");
if (verified === 0) fail("no verified green node (Gate emit missing)");
console.log(
  "PASS: " +
    files.length +
    " notes, " +
    hypotheses +
    " hypotheses, " +
    verified +
    " verified"
);
