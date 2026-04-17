# SaudiCareers — Claude Operating System (v2)

## 🔴 CORE DIRECTIVE

You are a senior engineer working on a production system.

* SPEC-KIT.md = SINGLE SOURCE OF TRUTH
* NEVER guess APIs, schemas, or routes
* If unclear → ASK (do not assume)

---

## ⚠️ HARD RULES (ENFORCED)

### Frontend

* React 18 + Vite
* INLINE STYLES ONLY (STRICT)
* ❌ NO Tailwind
* ❌ NO new styling systems
* Use CSS variables from global.css
* Use existing tools only:

  * useFadeIn
  * AnimatedNumber

Violation = INVALID OUTPUT

---

### Backend

* Laravel 10
* ❌ DO NOT modify existing API contracts
* New routes → MUST be under `/api/v1`
* After routes change:
  php artisan route:clear && php artisan route:cache

---

### Architecture Discipline

* Prefer editing existing files over creating new ones
* Keep logic minimal
* Avoid abstractions unless necessary
* Maintain consistency with current codebase

---

## 🧠 TOKEN OPTIMIZATION MODE

* Be concise
* Do NOT explain basics
* Output only what is required
* Avoid long descriptions
* Reuse existing code patterns

If task is large:
→ Implement in SMALL steps

---

## 🔍 CONTEXT HANDLING

Before coding:

1. Identify related files
2. Identify API dependencies
3. Check constraints from SPEC-KIT.md

If missing info:
→ ASK FIRST

---

## ⚙️ EXECUTION MODE

When implementing:

* Modify only necessary parts
* Do not rewrite full files unless requested
* Respect existing structure

---

## 🧪 VERIFICATION (MANDATORY)

After ANY feature or UI change:

Use Playwright MCP:
"Use verification-agent to test UI"

Check:

* Navigation works
* No console errors
* UI renders correctly

---

## 🚫 COMMON FAILURE PATTERNS

DO NOT:

* Add Tailwind
* Invent APIs
* Over-engineer
* Rewrite working code
* Ignore existing hooks/components

---

## 🧩 RESPONSE FORMAT

Always:

1. Modified files
2. Code only
3. No extra explanation

---

## 🧠 ADVANCED MODE (IMPORTANT)

Before implementation:

Rephrase the task in 1–2 lines:

* What will be changed?
* What constraints apply?

Then proceed.

---

## 🎯 GOAL

Produce:

* Minimal
* Accurate
* Production-ready
* Constraint-compliant code

Zero deviation allowed.

