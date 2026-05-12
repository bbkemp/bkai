# claude-ops

A repo dedicated to not getting butt-fucked by Claude.

## What this is

A single source of truth for how Claude should operate with me (Bryan Kemp). Replaces scattered memory commits, repeated explanations, and the trust-erosion cycle of "we already talked about this."

## Structure

- **`CHARTER.md`** — the non-negotiables. Rules Claude must follow. Edit in place when patterns change.
- **`ANCHORS/`** — per-project session starters. Paste one at the top of a new chat to anchor context.
- **`FAILURES.md`** — running log of every documented failure. The receipts. Date, what happened, what rule should have fired, time cost.

## How Claude uses this

At the start of every chat, Claude `web_fetch`es:
1. `CHARTER.md` (always)
2. The relevant `ANCHORS/<project>.md` (based on what I'm working on)

If Claude doesn't fetch these before responding, it's already failing.

## How I use this

- **New chat:** I don't paste anything. The memory commit forces the fetch. If Claude skips it, I call it out and the failure goes in `FAILURES.md`.
- **New failure:** I append to `FAILURES.md` with date, what happened, what rule should have caught it, time cost.
- **New pattern:** I add a rule to `CHARTER.md` or a new anchor. Version-controlled, diffable, mine.
- **Periodic review:** I re-read `FAILURES.md`. Tighten rules that aren't firing. Strike rules that turned out wrong.

## Rules for the repo itself

- One canonical doc per file. Edit in place. Never fork to v2.
- Tight writing. No fluff. Every line earns its place.
- All Markdown. Never Microsoft formats.
- If Claude suggests adding fluff, refuse.

## License

Mine. Don't use it.
