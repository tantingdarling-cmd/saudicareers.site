# 🎯 SaudiCareers.site AI Reference v2.1 (2026)

> **IMPORTANT:** This is the ground truth for SaudiCareers.site. Use this to maintain architectural integrity.

## 🛠 Tech Stack Summary

- **Frontend:** React 18 (Vite) - SPA.
- **Backend:** Laravel 10 (API Mode) - Cloudways Hosting.
- **Database:** MySQL 8 (6 Main Tables).
- **Critical Integrations:** Telegram Bot API, Anthropic API (ATS Engine).

## 🚀 Strategic Priorities (Snapchat & Twitter First)

- **Snapchat Traffic:** UI must be "Thumb-friendly" and ultra-fast for in-app browsers.
- **Twitter Traffic:** Meta tags must be optimized for "Twitter Cards".
- **Tracking:** Implement Snapchat Pixel & Twitter Pixel in the `<head>`.

## ⚠️ Known Gotchas

- Base path for Vite is `/`. Changing to `./` breaks SPA routing.
- Deployment is atomic: `dist/` folder replaces `public_html/`.
- .env on server contains Telegram & AI keys (DO NOT OVERWRITE).

## 🧭 Guidelines for AI

1. Use **Inline Styles** for React components (No new CSS files).
2. Follow **PDPL** (Saudi Data Protection Law) for all form submissions.
3. Language: **White Saudi Dialect** for users, Formal Arabic for Admin.
