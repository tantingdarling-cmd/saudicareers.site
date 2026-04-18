---
name: saudicareers-design
description: Use this skill to generate well-branded interfaces and assets for SaudiCareers (سعودي كاريرز) — a Saudi Arabian jobs platform — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. RTL/Arabic-first.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files (colors_and_type.css, preview/, ui_kits/marketing-site/, assets/, reference/).

Key reminders when designing for SaudiCareers:
- **Arabic RTL first.** Always set `dir="rtl"` and `lang="ar"`. Primary font: Noto Sans Arabic (shipped in `fonts/`). Production uses IBM Plex Sans Arabic — the DS substitutes with Noto for local delivery.
- **Palette:** deep Saudi green (`--g900: #003D2B`) + muted gold (`--gold500: #C5A059`) + green-tinted neutrals. Never pure gray.
- **Page bg is warm light** (`#F5F5F7`), not white. Cards sit on top in white with green-tinted shadows.
- **Copy is direct, evidence-based, informal second-person** (أنت, not حضرتكم).
- **Iconography:** Lucide React for UI icons; category emoji for job sectors; gold sparkle `✦` on primary CTAs; `←` is "forward" in RTL.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out of this skill and create static HTML files for the user to view. If working on production code, read `reference/src/` for the real components and patterns.

If the user invokes this skill without other guidance, ask them what they want to build, clarify audience and screen, then act as an expert designer who outputs HTML artifacts or production code.
