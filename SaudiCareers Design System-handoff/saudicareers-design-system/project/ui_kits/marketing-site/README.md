# SaudiCareers — Marketing Site UI Kit

Interactive recreation of the main marketing site (https://saudicareers.site). RTL Arabic-first. Built with inline JSX + Babel (no bundler) so it opens as a single static HTML file.

## Files
- `index.html` — assembles the full page, wires up state for the apply modal and filter chips.
- `Navbar.jsx` — glass RTL nav with scroll-state chrome.
- `Hero.jsx` — hero + floating AI-match preview card.
- `StatsBar.jsx` — dark green stat band with Arabic-Indic counters.
- `JobCard.jsx` / `JobsSection.jsx` — flagship card + filter chips + grid.
- `ServicesSection.jsx` — 3-card row with one featured dark variant.
- `HowItWorks.jsx` — 4-step numbered circles.
- `TipsSection.jsx` — dark section with gold eyebrows.
- `SignupForm.jsx` — footer signup with progressive reveal.
- `Footer.jsx` — 3-column dark green footer.

## Usage
Open `index.html` directly. Click filter chips to narrow jobs; click "التقديم" to open the apply sheet; scroll to see the glass nav shift. Uses Lucide icons via the static CDN.
