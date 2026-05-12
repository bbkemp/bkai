# ANCHOR — Tek Design System

Use this anchor when continuing work on the Tek Design System.

---

**Project:** Tek Design System
**Repo:** `github.com/bbkemp/tek-design-system`
**Packages:** `@bbkemp/tokens`, `@bbkemp/ui` (both published to GitHub Packages)
**Lead:** Bryan Kemp (sole maintainer for design + pipeline)

**Pipeline architecture:**
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

**Status as of last session:**
- v1.0.0 released. Versioning conventions established (patch = auto/CI, minor/major = manual).
- Qt translation layer complete.
- Four pipeline bugs fixed (DTCG format parsing, dark/light collision, missing px units, SHA race condition).
- `prefers-color-scheme` support added, combined CSS output.
- Onboarded into Claude Design (claude.ai/design).
- WPF/XAML output deferred pending consuming team's library decision.

**Internal stakeholders:**
- Richard (manager)
- Anurag, Mahesha (TekExpress modernization team)
- TekExpress modernization path: WinForms .NET 4.8 → .NET 8 → WPF → eventually Avalonia

**Working style for this project:**
- Single canonical document per file. Edit in place. Never fork to v2.
- All work in markdown. Component library and reference pages in HTML.
- Verify package versions and workflow status before suggesting changes.
- Don't rewrite working components — surgical edits only.
- Figma is source of truth for design tokens. Plugin commits to GitHub.

**Before responding:**
1. Read `../CHARTER.md`.
2. Search past chats for recent Tek Design System work if the request references prior decisions.
3. If unsure about current pipeline state, ask Bryan to confirm before suggesting changes.
