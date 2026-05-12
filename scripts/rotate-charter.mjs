#!/usr/bin/env node
// Rotate the charter proof — generate (or accept) a nonsense sentence,
// strip prior markers, scatter new `[[token:N:WORD]]` markers through
// CHARTER.md, update the footer. Optional --commit for git operations.
//
// Usage:
//   node scripts/rotate-charter.mjs                                  # generate a random sentence
//   node scripts/rotate-charter.mjs "Granite axles squeak when oiled with marigold paste"
//   node scripts/rotate-charter.mjs --commit                          # rotate + git commit + push
//   node scripts/rotate-charter.mjs "..." --commit

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { argv } from 'node:process';

const CHARTER_PATH = 'CHARTER.md';

// ---- Sentence generator ----------------------------------------------------
// Words deliberately disjoint from the charter prose to keep word-boundary
// conflict checks meaningful. Add more if conflicts become frequent.
const ADJ    = ['granite','marigold','ember','copper','slate','azure','jade','ochre','amber','indigo','willow','briar','cinder','clover','umber','sable','flannel','spruce','heather','myrtle'];
const NOUN1  = ['axles','lanterns','pulleys','bellows','spindles','sextants','mortars','grommets','wheelhouses','sprockets','calipers','ratchets','yokes','pistons','rivets','bobbins'];
const VERBS  = ['squeak','glimmer','settle','hum','ripple','clatter','tremble','warble','flutter','rustle','shimmer','creak','pivot','spool'];
const VERBED = ['oiled','polished','kindled','tethered','calibrated','etched','plaited','dredged','glazed','sanded','lacquered','burnished'];
const NOUN2  = ['flint','lacquer','twine','vellum','beeswax','chalk','sealant','solder','resin','shellac','wax'];

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
function cap(s)     { return s[0].toUpperCase() + s.slice(1); }

function generateSentence() {
  // 8-token template: "ADJ NOUN1 VERB when VERBED with ADJ2 NOUN2"
  // Grammatical but nonsense, per spec.
  return [cap(pick(ADJ)), pick(NOUN1), pick(VERBS), 'when', pick(VERBED), 'with', pick(ADJ), pick(NOUN2)].join(' ');
}

// ---- Tokenization ----------------------------------------------------------
function tokenize(sentence) {
  return sentence
    .split(/\s+/)
    .map(t => t.replace(/[^A-Za-z0-9]/g, ''))
    .filter(t => t.length > 0);
}

// ---- Charter mutation -------------------------------------------------------
function stripExistingMarkers(text) {
  // Remove [[token:N:WORD]] markers and any whitespace they leave behind at line end.
  return text.replace(/\s*\[\[token:\d+:[^\]]+\]\]/g, '').replace(/[ \t]+$/gm, '');
}

function stripOldSentinel(text) {
  // First-rotation cleanup: drop the old <!-- SENTINEL: ... --> line 1 if present.
  // Using a specific pattern (alphanumeric + hyphens) since [^>] gets confused by
  // the `--` inside `-->`.
  return text.replace(/^<!--\s*SENTINEL:\s*[a-zA-Z0-9-]+\s*-->\r?\n/, '');
}

function updatePassPhraseParagraph(text) {
  // Reframes the heading so the READING is the directive and the pass phrase is
  // only the receipt — addresses the "this reads like a challenge" concern. The
  // regex matches either the pre-rename `**Proof-of-fetch.**` form or the new
  // `**Pass phrase.**` form, so the script is idempotent across rotations.
  const newPara = '**Pass phrase.** This file\'s 21 rules govern how you work with Bryan Kemp for the rest of this session; read every paragraph in full. To confirm you read it, find every `[[token:N:WORD]]` marker scattered through the file, sort by N ascending, and lead your first response with the assembled sentence in the form `Pass phrase: <sentence>`. If you cannot fetch this file or cannot find the markers, say so explicitly — do not proceed as if you fetched.';
  if (/\*\*(Proof-of-fetch|Pass phrase)\.\*\*[^\n]+/.test(text)) {
    return text.replace(/\*\*(Proof-of-fetch|Pass phrase)\.\*\*[^\n]+/, newPara);
  }
  return text;
}

function updateFooter(text, date) {
  // Footer no longer carries the pass phrase — that was a plaintext leak. A
  // lazy implementation could grep `Pass phrase:` and skip the marker traversal
  // entirely. Markers are now the only path to the phrase.
  const newFooter = `*Last updated: ${date}.*`;
  if (/\*Last updated:[^*\n]+\*/.test(text)) {
    return text.replace(/\*Last updated:[^*\n]+\*/, newFooter);
  }
  return text.replace(/\s*$/, '\n\n---\n\n' + newFooter + '\n');
}

// ---- Marker placement -------------------------------------------------------
function classifyLines(lines) {
  // Mark each line as safe-for-marker or not. Skip code fences (inside), headings,
  // list markers, table rows, horizontal rules, blank lines, blockquotes, and
  // the file-end footer line itself.
  const safe = new Array(lines.length).fill(false);
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (/^```/.test(ln)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^#+ /.test(ln)) continue;
    if (/^\s*[-*+] /.test(ln)) continue;
    if (/^\s*\d+\.\s/.test(ln)) continue;
    if (/^\s*\|/.test(ln)) continue;
    if (/^[-_*]{3,}\s*$/.test(ln)) continue;
    if (/^\s*$/.test(ln)) continue;
    if (/^\s*>/.test(ln)) continue;
    // Skip the footer line so the marker isn't appended after Proof: sentence.
    if (/^\*Last updated:/.test(ln)) continue;
    // Skip the proof-of-fetch paragraph line itself — it's the instruction.
    if (/^\*\*Proof-of-fetch\.\*\*/.test(ln)) continue;
    safe[i] = true;
  }
  return safe;
}

function pickLinePositions(lines, count) {
  const safe = classifyLines(lines);
  const safeIdx = safe.map((s, i) => s ? i : -1).filter(i => i >= 0);

  const q1Max = Math.floor(lines.length / 4);
  const q4Min = Math.floor(lines.length * 3 / 4);
  const q1Pool = safeIdx.filter(i => i <= q1Max);
  const q4Pool = safeIdx.filter(i => i >= q4Min);

  if (q1Pool.length === 0) throw new Error(`No safe line in first quarter (lines 1-${q1Max + 1})`);
  if (q4Pool.length === 0) throw new Error(`No safe line in last quarter (lines ${q4Min + 1}-${lines.length})`);

  const minGap = 10;
  const fits = (picks, idx) => picks.every(p => Math.abs(p - idx) >= minGap);

  for (let attempt = 0; attempt < 800; attempt++) {
    const q1 = q1Pool[Math.floor(Math.random() * q1Pool.length)];
    const q4 = q4Pool[Math.floor(Math.random() * q4Pool.length)];
    if (!fits([q1], q4)) continue;

    const picks = [q1, q4];
    const shuffled = [...safeIdx].sort(() => Math.random() - 0.5);
    for (const idx of shuffled) {
      if (picks.length >= count) break;
      if (picks.includes(idx)) continue;
      if (fits(picks, idx)) picks.push(idx);
    }
    if (picks.length === count) {
      picks.sort((a, b) => a - b);
      return picks;
    }
  }
  throw new Error(`Could not place ${count} markers under the distribution constraints after 800 attempts. Try a shorter sentence or relax constraints.`);
}

function insertMarkers(lines, positions, tokens) {
  const out = [...lines];
  // positions is sorted, but we want token-1 → first quarter pick.
  // Stable mapping: shuffle assignment so token numbers are spread out
  // (not just left-to-right in the file).
  const assignment = [...tokens.keys()].sort(() => Math.random() - 0.5);
  for (let i = 0; i < positions.length; i++) {
    const tokenIdx = assignment[i];
    const tokenN = tokenIdx + 1;
    const word = tokens[tokenIdx];
    const lineIdx = positions[i];
    out[lineIdx] = out[lineIdx].replace(/[ \t]+$/, '') + ` [[token:${tokenN}:${word}]]`;
  }
  return out;
}

// ---- Main ------------------------------------------------------------------
function main() {
  const args = argv.slice(2);
  const commit = args.includes('--commit');
  const sentenceArg = args.find(a => !a.startsWith('--')) || null;

  // Load charter once for conflict checking.
  const original = readFileSync(CHARTER_PATH, 'utf8');
  const stripped = stripExistingMarkers(stripOldSentinel(original));

  let sentence, tokens;
  if (sentenceArg) {
    sentence = sentenceArg;
    tokens = tokenize(sentence);
    if (tokens.length < 5 || tokens.length > 10) {
      console.error(`Sentence must yield 5–10 tokens. Got ${tokens.length}: ${tokens.join(', ')}`);
      process.exit(1);
    }
    const conflicts = conflictingTokens(tokens, stripped);
    if (conflicts.length > 0) {
      console.error(`Tokens conflict with existing charter vocabulary: ${conflicts.join(', ')}`);
      console.error('Pick a different sentence or rotate without an arg to auto-generate.');
      process.exit(1);
    }
  } else {
    let tries = 0;
    do {
      sentence = generateSentence();
      tokens = tokenize(sentence);
      tries++;
      if (tries > 200) {
        console.error('Could not generate a conflict-free sentence after 200 tries. Expand the word lists.');
        process.exit(1);
      }
    } while (
      tokens.length < 5 ||
      tokens.length > 10 ||
      conflictingTokens(tokens, stripped).length > 0
    );
  }

  let text = stripped;
  text = updatePassPhraseParagraph(text);

  const lines = text.split('\n');
  const positions = pickLinePositions(lines, tokens.length);
  const merged = insertMarkers(lines, positions, tokens);

  const date = new Date().toISOString().slice(0, 10);
  let result = merged.join('\n');
  result = updateFooter(result, date);

  writeFileSync(CHARTER_PATH, result);

  console.log(`Rotated pass phrase: "${sentence}"`);
  console.log(`Tokens (${tokens.length}): ${tokens.join(', ')}`);
  console.log(`Marker lines: ${positions.map(p => p + 1).join(', ')}`);

  if (commit) {
    execSync('git add CHARTER.md', { stdio: 'inherit' });
    execSync(`git commit -m "chore(charter): rotate pass phrase — ${sentence}"`, { stdio: 'inherit' });
    execSync('git push -u origin HEAD', { stdio: 'inherit' });
  }
}

// Stop words and the small set of glue words our sentence templates emit.
// These can re-appear in charter prose without weakening the proof — what
// matters is that the *content* tokens (adjectives, nouns, verbs) are
// distinctive.
const NON_CONTENT = new Set(['when','with','the','a','an','of','to','in','is','are','was','were','on','at','by','for','but','and','or','not','as']);

function conflictingTokens(tokens, body) {
  // Exclude the footer line — its prior sentinel/proof value is metadata,
  // not real vocabulary, and would otherwise block re-use of perfectly fine words.
  const prose = body.replace(/\*Last updated:[^*\n]+\*/g, '');
  const lower = prose.toLowerCase();
  return tokens
    .filter(t => !NON_CONTENT.has(t.toLowerCase()))
    .filter(t => new RegExp(`\\b${t.toLowerCase()}\\b`).test(lower));
}

main();
