# SaudiCareers Design System

منصة **Saudi Careers (سعودي كاريرز)** — منصة سعودية متخصصة في التوظيف وتحسين السيرة الذاتية لسوق العمل السعودي. تجمع فرص العمل من كبرى الشركات (أرامكو، نيوم، صندوق الاستثمارات العامة) وتوفر أدوات AI لتحليل السير الذاتية ومطابقتها مع الوظائف.

**Tagline:** "طريقك للفرصة" / "Your Path to Opportunity"

---

## 1. Context & Sources

### Source repository
- **GitHub:** `tantingdarling-cmd/saudicareers.site` (imported @ `main`)
- **Production URL:** https://saudicareers.site
- **Stack:** React 18 + Vite SPA frontend · Laravel 10 backend · deployed on Cloudways
- **Imported files:** see `reference/` (full `src/` + selected `public/` assets)

### Products represented
1. **Marketing site** (`/`) — hero, jobs feed, services, tips, CTA. *Primary product.*
2. **Resume Analyzer** (`/resume-analyzer`) — upload PDF → 7-dimension AI match score.
3. **Admin dashboard** (`/admin`) — job moderation, HQL triage, settings.
4. **Application tracking** (`/track/:token`) — candidate self-service status.

This design system focuses on the **marketing site** as the primary UI kit.

### Design philosophy
- **Bilingual-first:** Arabic (RTL) is primary, English used for numbers, statistics, and the brand wordmark only.
- **Vision 2030 coded:** deep Saudi green + muted gold = national credibility without being literal flag cosplay.
- **Trust via restraint:** plenty of whitespace, no garish gradients, no hero illustrations. Proof comes from real company names (أرامكو، نيوم، PIF), not stock imagery.

---

## 2. Content Fundamentals (Tone & Copy)

### Voice
- **Addressing the reader:** direct second-person, **informal** form (`أنت`, not `حضرتكم`). Ex: "ارفع مستواك في سوق العمل".
- **Empowering, not instructional.** The copy positions the user as the agent, not a passive recipient. "احصل على وظيفتك" rather than "سنساعدك في الحصول على وظيفة".
- **Evidence-based framing.** Headlines pair a promise with a credible stat (e.g. "75% من السير الذاتية تُرفض آلياً"). Numbers earn trust.
- **Humble authority.** Uses phrases like "نجمع الفرص"، "نتحقق من مصداقيتها" — present tense, matter-of-fact.

### Casing & typography conventions
- **Arabic:** sentence-case only (Arabic has no case). Punctuation is minimal — Arabic comma `،` and Arabic question mark `؟` when needed.
- **English brand mark:** `Saudi` + `Careers` with a **gold-colored "Careers"**. Always single word, no space collapse (`SaudiCareers` in the domain, `Saudi Careers` in display).
- **Numbers:** Arabic-Indic digits (`٠١٢٣٤٥٦٧٨٩`) for UI stats that should feel local; Western digits (`0–9`) acceptable inside dense data tables / technical contexts. The codebase uses a `toAr()` helper for hero stats.
- **Percentages:** prefer `٪` (Arabic percent) in user-facing copy, `%` acceptable in data contexts.
- **Saudi Riyal:** `ر.س` after the amount.
- **Eyebrows (pre-heading labels):** ALL-CAPS feel simulated via `letter-spacing: 1.5px` and `font-weight: 700`; actual Arabic glyphs are not uppercased. Gold color.

### Emoji & symbols
- **Yes, used sparingly** — and with intent:
  - **Category icons** on job cards: `💻 🏦 ⚡ 🏗️ 👥 📣 🏥 🎓 💼` (codepoints map to sectors).
  - **Flag / locale markers:** `🇸🇦` in the OG image.
  - **CTAs:** `✦` (sparkle) and `←` (back arrow used as "forward" in RTL) — directional glyphs are flipped for RTL.
  - **Accent bullets:** `🏆 🤖 🔒 ★` in promo cards and trust ribbons.
- **Never** emoji as a replacement for UI iconography (icons come from Lucide — see ICONOGRAPHY).

### Phrase bank (canonical copy)
| Use | Arabic | English mirror |
|---|---|---|
| Primary CTA | `افحص سيرتك مجاناً ✦` | "Analyze your CV for free" |
| Secondary CTA | `تصفّح الوظائف` | "Browse jobs" |
| Detail link | `التفاصيل ←` | "Details" |
| Apply button | `التقديم ←` | "Apply" |
| Signup confirm | `تم التسجيل!` | "You're in!" |
| Trust line | `بياناتك آمنة ولن تُشارك مع أي طرف ثالث` | Privacy line |
| Early access pill | `وصول مبكر مجاني — سجّل الآن` | Early-access badge |
| Social proof | `انضم أكثر من 120+ محترف` | "120+ pros joined" |

### Don'ts
- No ALL-CAPS in Arabic body copy (even English loanwords stay lowercase).
- No exclamation marks in headlines (save `!` for success states).
- No hedging language (`ربما`, `قد يساعدك`) — be definite.
- No generic stock phrases ("your one-stop shop", "unlock your potential"). Each claim is specific and measurable.

---

## 3. Visual Foundations

### Palette
Three families: **Greens** (brand/primary), **Gold** (accent/premium), **Green-tinted neutrals** (text/surface).

- **`--g900` #003D2B** is the brand primary — used on hero CTAs, nav brand mark, stats section bg.
- **`--g950` #001a0d** is the darkest deck — footer, tips section, high-contrast panels.
- **`--gold500` #C5A059** is *the* accent. Exclusive/featured markers, the CTA in the nav, gradient underlines, star bullets. Use on ≤15% of any surface — it loses meaning past that.
- Grays are **deliberately green-tinted** (e.g. `--gray200: #D9E2DC`) to sit harmoniously with the greens. Never use pure neutral grays (`#E5E5E5`), they look cold against the palette.
- Page background is **`#F5F5F7`** (warm very-light), NOT pure white. The white cards then feel "lifted" on top.

### Imagery
- The production site uses **no photography**. No generic stock business shots.
- **Illustration:** minimal — the only illustrative element is the **floating AI match card** in the hero (a faux-UI preview), which is real UI composition, not an illustration.
- **OG image / social share:** SVG-based composition with Saudi green gradient + gold accent bars + `🇸🇦` flag glyph in a translucent circle. See `assets/og-image.svg`.
- **Backgrounds:** soft radial gradients on the hero (ellipses at top-center and right with ~6% opacity greens and ~4% opacity gold). Solid color for other sections. **No patterns, no textures, no mesh gradients, no blobs.**

### Backgrounds & sections
Section colors alternate in a specific rhythm:
1. Hero → `#F5F5F7` + radial green/gold glow
2. Stats → `var(--g900)` (dark brand green)
3. Jobs → `var(--gray50)`
4. Services → `white`
5. How it works → `var(--gray50)`
6. Tips → `var(--g950)` (darkest)
7. Footer CTA → `var(--g50)` (pale mint)
8. Footer → `var(--g950)`

Dark sections use **pure dark green**, never blue-black or neutral black.

### Typography rules
- **Headings:** Noto Sans Arabic (variable), weight **500** (Medium) — production uses IBM Plex Sans Arabic; we ship Noto Sans Arabic locally as the design-system font (close geometric match, full variable-font control). All `h1–h6` default to 500; hero is overridden to 700.
- **Body:** Noto Sans Arabic, 400. Line-height `1.75` (loose, good for Arabic diacritics room).
- **Numbers & brand:** Plus Jakarta Sans. Weight 800 for stat counters, 700 for the SaudiCareers wordmark.
- **No italic anywhere.** Neither IBM Plex Arabic nor Noto Sans Arabic ship a true italic, and the design avoids oblique fakes.
- **Letter-spacing:** tight (-0.5px) on the hero H1; +1.5px on eyebrows; default everywhere else.

### Spacing
- Sections: `clamp(60px, 8vw, 100px)` vertical padding — generous.
- Content max-width: `1160px`.
- Component padding follows `4 / 8 / 12 / 16 / 20 / 24 / 32` rhythm (matches the inline-style numbers throughout components).

### Radii
- **8 / 12 / 18 / 24** — four-step ramp. Pills use `50px`.
- Cards use 18–20px. Buttons use 12px (primary/secondary) or pill (50px for nav CTA / filter chips / tags).
- The Bottom Sheet uses `20px 20px 0 0` (asymmetric — top-only).

### Shadows (3 tiers + 1 accent)
```
--shadow-sm:   0 1px 4px   rgba(0,61,43,0.08)   ← subtle lift (nav on scroll)
--shadow-md:   0 4px 16px  rgba(0,61,43,0.10)   ← default card rest state
--shadow-lg:   0 12px 40px rgba(0,61,43,0.14)   ← card hover / modal
--shadow-gold: 0 4px 20px  rgba(197,160,89,0.3) ← gold CTA glow
```
All shadows are **green-tinted**, not neutral gray/black. Inner shadows are not used.

### Borders
- Default: `1.5px solid var(--gray200)` (slightly heavier than typical 1px).
- Hover: border swaps to `var(--g400)` (mint-green).
- Focus ring: `border-color: var(--g600)` + `box-shadow: 0 0 0 3px rgba(0,102,68,0.1)`.
- Divider lines on dark bg: `1px solid rgba(255,255,255,0.08)`.

### Hover states
- **Cards:** `translateY(-4px)` + shadow upgrade to `--shadow-lg` + border color swap to green. Transition `0.25–0.45s cubic-bezier(0.19,1,0.22,1)`.
- **Primary buttons:** background darkens from gradient to solid `--g700`.
- **Gold buttons:** background lightens to `--gold400`.
- **Text links:** color swaps to gold/green accent, no underline.
- **Nav items:** bg fades to `--g50`, color to `--g800`.

### Press states
- Buttons: `transform: scale(0.97)` with `transition: 0.1s`.
- Tag chips: `scale(0.94)`.
- No color change on press; scale is the press signal.

### Animation
- **Easing:** `cubic-bezier(0.19, 1, 0.22, 1)` (expo-out, decelerate-heavy) for reveals. `cubic-bezier(0.32, 0.72, 0, 1)` for sheets/modals (pop).
- **Scroll-reveal:** opacity 0→1 + `translateY(28px)→0` over 650ms, triggered via IntersectionObserver. Stagger delays: 0 / 60 / 100 / 200ms.
- **Hero decorative float:** 6s infinite ease-in-out `translateY(-12px)` + `rotate(±1deg)` — applied to the AI preview card.
- **Pulse:** 2s infinite on the status dot (green) — used on "early access" badge.
- **CountUp:** cubic easing, 1600ms — stat numbers.
- **SVG ring fill:** 2.5s expo-out — score ring on AI card.
- **Full respect for `prefers-reduced-motion`:** animations reduce to 0.01ms, float/pulse disabled, shimmer replaced with solid color.

### Transparency & blur
- Nav: `rgba(255,255,255,0.72)` when top, `0.82` when scrolled. `backdrop-filter: blur(15px) saturate(180%)`.
- Mobile menu: `rgba(255,255,255,0.88)` + `blur(20px)`.
- Bottom sheet backdrop: `rgba(0,0,0,0.45)` + `blur(4px)`.
- Dark-section cards: `rgba(255,255,255,0.05)` rest, `0.09` hover.
- Blur is used for **chrome layers only** (nav, sheets), never for decorative effects.

### Layout rules
- **Fixed:** only the top nav (`position: fixed`, z-index 200).
- **RTL-first:** `dir="rtl"`, `lang="ar"`. All layouts use logical properties (`insetInline`, `marginInlineStart`) where possible. Icons facing direction (arrows) are mirrored.
- **Grid:** `repeat(auto-fit, minmax(min(100%, 320px), 1fr))` for job cards. Content max-width 1160px.
- **Section spacing:** vertical `clamp(60px, 8vw, 100px)`; horizontal `clamp(1rem, 4vw, 3rem)`.

### Card anatomy
Standard card:
- Background `white`
- Border `1.5px solid var(--gray200)` (swaps to `--g400` on hover)
- Radius `18–20px`
- Padding `24–32px`
- Shadow `--shadow-card` (≈ `0 8px 32px rgba(0,0,0,0.08)`) → `--shadow-lg` on hover
- Often a **bottom accent bar** (`height: 3px` → `4px` on hover, colored gold/green/mint per variant)

---

## 4. Iconography

### Primary system: **Lucide React** (`lucide-react@0.294.0`)
- Stroke-based, 1.5–2px stroke weight, consistent 24×24 grid.
- Used at sizes 12 / 13 / 14 / 15 / 16 / 20 / 22px depending on context.
- Icons seen in the codebase:
  - Navigation: `Menu`, `X`
  - Action: `ArrowLeft`, `CheckCircle`
  - Meta: `MapPin`, `Briefcase`, `Coins`, `Clock`, `FileText`, `Lightbulb`
- **CDN substitution for this design system:** since we're not bundling React, we use **lucide icon SVGs via the static CDN** (`https://unpkg.com/lucide-static@latest/icons/<name>.svg`). Matches the production system 1:1.

### Category emoji (job cards)
Sector-coded single-glyph emoji used as company avatars when no logo is provided. Fixed mapping in `data/index.js`:
```
tech: 💻 · finance: 🏦 · energy: ⚡ · construction: 🏗️ · hr: 👥
marketing: 📣 · healthcare: 🏥 · education: 🎓 · other: 💼
```
Rendered at 22–26px inside a `46×46` rounded square with `--g50` background and `--g100` border.

### Logo
- **Primary:** circular bitmap avatar (`saudi.png` / `saudi.webp`) — not shipped in this design system (asset not in public repo import). Production version is a ~44–46px circle on a black background inside the nav. **FLAGGED** — see Caveats.
- **Wordmark:** text-based, `Saudi` in `--g900` + `Careers` in `--gold500`, set in Plus Jakarta Sans 700/17px.
- **OG image** (social share): see `assets/og-image.svg` — full 1200×630 composition.

### Unicode glyphs as icons
Used deliberately:
- `✦` — sparkle accent on primary CTAs (free analyzer)
- `←` / `→` — flipped for RTL (`←` = "next" in Arabic reading)
- `★` — premium / featured markers
- `·` — separator in metadata
- `🔒` — privacy indicator in PDPL trust line
- `🏆` — excellent match badge

### Decoration
- **Gold divider line** (`width: 28px; height: 2px; background: var(--gold500)`) — used as a visual bullet inside eyebrows and before section titles.
- Status dot (`7×7px` green circle with pulse animation).

---

## 5. Index (File Manifest)

```
SaudiCareers-Design-System/
├── README.md                    ← you are here
├── SKILL.md                     ← skill definition (Claude Skills compatible)
├── colors_and_type.css          ← single source for all CSS vars
├── assets/
│   └── og-image.svg             ← 1200×630 social share (Saudi green + gold)
├── preview/                     ← design system review cards
│   ├── colors-brand.html        ← green scale + gold scale
│   ├── colors-neutrals.html     ← green-tinted grays + semantic
│   ├── type-display.html        ← hero / H2 / H3 specimens
│   ├── type-body.html           ← body + meta + eyebrow + brand mark
│   ├── spacing-radii.html       ← 4→24 radii visualized
│   ├── spacing-shadows.html     ← 3 green-tinted shadow tiers + gold
│   ├── components-buttons.html  ← primary / gold / secondary / pill
│   ├── components-inputs.html   ← input + select + focus state
│   ├── components-jobcard.html  ← the hero component
│   ├── components-badges.html   ← featured / hot / new / PDPL
│   ├── components-nav.html      ← glass nav with scroll state
│   └── brand-logo.html          ← wordmark + OG + favicon callout
├── ui_kits/
│   └── marketing-site/
│       ├── README.md
│       ├── index.html           ← interactive clickthrough
│       ├── Navbar.jsx           ← glass RTL nav
│       ├── Hero.jsx             ← hero + floating AI card
│       ├── StatsBar.jsx         ← dark green count-up stats
│       ├── JobCard.jsx          ← the flagship card
│       ├── JobsSection.jsx      ← filter chips + grid
│       ├── ServicesSection.jsx  ← 3-card row with featured
│       ├── HowItWorks.jsx       ← 4-step numbered circles
│       ├── TipsSection.jsx      ← dark bg, gold eyebrows
│       ├── SignupForm.jsx       ← progressive-reveal form
│       └── Footer.jsx           ← dark green 3-col footer
└── reference/                   ← source-of-truth imports (read-only)
    ├── src/                     ← full React app from the repo
    ├── robots.txt
    └── sitemap.xml
```

---

## 6. Caveats & Open Questions

1. **Logo bitmap missing.** The production site references `/saudi.png` + `/saudi.webp` which weren't in the GitHub repo import (they live in `public/` but aren't text-importable). **Action needed:** export the circular logo from the live site or attach it here.
2. **No Figma source provided.** This design system is reverse-engineered from the React codebase. If a Figma file exists, linking it would unlock variants/states not shown in the current code paths.
3. **Font files are CDN-linked** (Google Fonts). For offline / PPTX / print use, we'd want to ship the TTF/WOFF2 files in `fonts/`. Currently *not* shipped — flagged for the user.
4. **Admin dashboard, Resume Analyzer UI, JobDetail page** are not yet modeled as UI kit components — they're in `reference/src/pages/` if you want to pull them next.
5. **Arabic-Indic numerals in stats** use a runtime JS helper (`toAr()`). Kept identical in the UI kit.
6. **Bilingual variants.** The site is Arabic-only in production; no English UI exists. If bilingual support is coming, we'd need a separate type scale audit for `Plus Jakarta Sans` used at body sizes.
