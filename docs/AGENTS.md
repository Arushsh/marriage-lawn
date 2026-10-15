# AGENTS.md: Rules for coding agents (Antigravity)

Read this file first in every session. Then read the docs it points to.

## Project
Marriage lawn website template. MVP only (PRD F-01 to F-16). Specs live in /docs:
PRD.md, TECH.md, UI.md, DATABASE.md, API.md, TASKS.md, CONTENT.md. If DESIGN.md exists in the root, it is the source of truth for visual style.

## How we work
- Work in chunks. Do only the chunk you were given, then stop and report.
- Before writing code for a chunk: write a 5-10 line plan, then proceed without waiting unless blocked.
- After each chunk: run build, lint and tests, then run the review gate below, then commit.
- Tick finished items in docs/TASKS.md and log decisions in docs/DECISIONS.md.
- Never start Phase 2 features. Never add dependencies without a one-line reason in DECISIONS.md.

## Review gate (CodeRabbit plugin), run at the end of every chunk
1. Run the CodeRabbit code review skill/agent on the uncommitted changes.
2. Fix every critical and major finding. For minor ones, fix if cheap, otherwise list them in docs/REVIEW_LOG.md.
3. Re-run build, lint and tests.
4. Only then commit with a clear message ("Chunk N: <what>").
Never skip the gate to save time. Never mark a chunk done with failing tests or build.

## Plugins installed (use when relevant)
- **coderabbit:** review gate above. Use its autofix agent for review findings.
- **gemini-api:** use for Phase 2 chatbot work only (Gemini API + its MCP server). Do not add AI features to the MVP.
- **caveman:** terse mode applies to your chat replies only. Never apply it to code, comments, docs, commit messages, error messages or any user-facing website copy.
- **ponytail:** run /skills to see its 6 skills. Use a ponytail skill when its description matches the task at hand, and name the skill you used in your report. Do not invent usages.
- **Stitch MCP:** used ONLY in the UI revamp phase (see docs/TASKS.md, Phase 3.5). Do not call it during other chunks.

## Reference sites
docs/REFERENCES.md lists ideas taken from other venue sites (alron.in). Use them for structure and features only. Never copy their text, images, logos, layout or graphics. Do not copy their weaknesses either (dense text, ornamental graphics, typos).

## Code rules
- Mobile first (360px). Typed code (TypeScript strict, Python type hints where useful).
- No hardcoded venue data, secrets or API URLs. Env vars only. Keep .env.example current.
- One Button component, lucide-react icons only, next/image for all images.
- Reuse components. No duplicated form, calendar or section code.
- Dates: build date keys in local time (IST), never with toISOString().
- Public API never exposes private notes, IPs or admin fields.
- Accessible by default: labels, alt text, focus states, keyboard support.

## Design rules (until DESIGN.md exists)
- Spacious, minimal, plain specific copy. No emojis, gradients, glow, glassmorphism, pulsing or filler words ("Discover", "Elevate", "Seamless", "Unforgettable").
- Colors: ivory background, near-black text, maroon primary, gold used sparingly.
- One subtle fade-in on scroll only. Respect prefers-reduced-motion.

## Definition of done for a chunk
- Build, lint and tests pass. Review gate passed. Works at 360, 768 and 1280px.
- No console errors. TASKS.md ticked. Commit made.
- Report: what changed, what was skipped and why, how to test on mobile. Keep it short.
