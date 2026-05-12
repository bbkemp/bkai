# claude-ops

A repo dedicated to not getting butt-fucked by Claude.

## What this is

A single source of truth for how Claude should operate with me (Bryan Kemp). Replaces scattered memory commits, repeated explanations, and the trust-erosion cycle of "we already talked about this."

This is the **personal** layer — about how Claude collaborates with me. The **repo** layer (design system rules, token contracts, branch conventions) lives in each project's own `CLAUDE.md` / `CONTRIBUTING.md`. Other people working on those repos get the repo layer only. Me + AI get both layers stacked.

## Structure

- **`CHARTER.md`** — the non-negotiables. Numbered rules Claude must follow. Top of the file carries a rotating sentinel string so I can verify Claude actually fetched the current charter rather than answering from priors.
- **`FAILURES.md`** — running log of every documented failure. Receipts. Date, what happened, what rule should have fired, time cost.
- **Anchor files at repo root** — per-project session starters (`default.md`, `design-system.md`, `homebrew.md`, more as needed). Fetched at the start of a chat to load project-specific context on top of the charter.

## How Claude uses this

### Web Claude (claude.ai chat)

At the start of every chat, `web_fetch`es:
1. `CHARTER.md` (always) — and echoes the sentinel in the form `Sentinel: <value>` to prove the fetch actually happened
2. The relevant anchor file based on the project (e.g., `design-system.md` for Tek Design System work)
3. Any repo-level contract the anchor references (e.g., `tek-design-system/CLAUDE.md` raw URL)

If Claude doesn't fetch these — or fetches but can't quote the sentinel — it's already failing.

### Claude Code (CLI, in an actual repo)

`CLAUDE.md` in the working directory auto-loads — that's the repo layer, no fetch needed. Memory points at this repo for the personal layer. Both apply; no duplicate fetch of the repo's own `CLAUDE.md`.

## How I use this

- **New chat:** I don't paste anything. The memory commit forces the fetch. If Claude skips it or fakes the sentinel, I call it out and the failure goes in `FAILURES.md`.
- **New failure:** I append to `FAILURES.md` with date, what happened, what rule should have caught it, time cost.
- **New pattern:** I add a rule to `CHARTER.md` or a new anchor. Rotate the sentinel in the same edit. Version-controlled, diffable, mine.
- **Periodic review:** I re-read `FAILURES.md`. Tighten rules that aren't firing. Strike rules that turned out wrong.

## Rules for the repo itself

- One canonical doc per file. Edit in place. Never fork to v2.
- Tight writing. No fluff. Every line earns its place.
- All Markdown. Never Microsoft formats.
- If Claude suggests adding fluff, refuse.
- The sentinel rotates whenever CHARTER.md changes — that's how stale-cache fetches get caught.

## License

Mine. Don't use it.
