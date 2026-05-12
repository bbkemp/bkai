---
name: design-system-anchor
description: Project context for the Tek Design System (bbkemp/tek-design-system). Pipeline, packages, stakeholders, Bryan-specific overlays. Use when working on design-system code, tokens, components, or pipeline. Pair with the `charter` rule.
---

# Tek Design System — project anchor

Use when continuing work on the Tek Design System.

---

## Load order

Two layers, both apply:

1. **Personal layer:** the `charter` rules (universal rules for working with Bryan).
2. **Repo layer:** `tek-design-system/CLAUDE.md` (raw URL: <https://raw.githubusercontent.com/bbkemp/tek-design-system/main/CLAUDE.md>). That file is the universal design-system contract — applies to anyone working on the repo. Read it before suggesting any code, token, or pipeline change.
3. Then read the rest of this anchor for Bryan-specific overlays on this project.

Direction matters: this anchor knows about the repo. The repo does not know about this anchor. Other contributors get the repo layer only.

---

**Project:** Tek Design System
**Repo:** `github.com/bbkemp/tek-design-system`
**Packages:** `@bbkemp/tokens`, `@bbkemp/ui` (both published to GitHub Packages)
**Lead:** Bryan Kemp (sole maintainer for design + pipeline)

**Pipeline architecture (summary; see repo CLAUDE.md + README for the canonical version):**

```
Figma Variables
  → Token Push plugin (custom, exports W3C DTCG JSON, commits to GitHub)
  → Style Dictionary build (GitHub Actions)
  → Outputs:
     • CSS custom properties → @bbkemp/tokens
     • Qt / QSS (TekTokens.h, tek.dark.qss, tek.light.qss)
     • C++ headers (for TekExpress)
     • WPF / XAML (pending — library decision Telerik vs ComponentOne)
```

**Token hierarchy:** Primitive → Semantic → Component (three-tier)

**Internal stakeholders:**
- Richard (manager)
- Anurag, Mahesha (TekExpress modernization team)
- TekExpress modernization path: WinForms .NET 4.8 → .NET 8 → WPF → eventually Avalonia

**Bryan-specific overlays for this project:**
- Trigger phrases ("let's push it" / "merge it" / "status" / "park it" / "new branch for X" / "undo that") are codified in [`docs/workflow.md`](https://github.com/bbkemp/tek-design-system/blob/main/docs/workflow.md). Honor them exactly; no improvisation.
- For state checks before edits (current pipeline status, package versions, open PRs), use the GitHub API or CLI rather than dragging Bryan through `gh auth login`.
- After a PR merges, `cd` to the main repo root before `git checkout main`. Never `git checkout main` from inside a worktree.

**Before responding, also:**
- Search past chats for recent Tek Design System work if the request references prior decisions.
- If unsure about current pipeline or package state, ask Bryan to confirm before suggesting changes. Don't guess from priors.
