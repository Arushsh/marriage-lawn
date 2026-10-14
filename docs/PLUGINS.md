# Installed Plugin Skills

## coderabbit
| Skill | Description |
|---|---|
| `coderabbit-review` | Run CodeRabbit CLI on uncommitted changes, a directory, or a PR; return findings and a fix plan. |
| `coderabbit-autofix` | Review unresolved CodeRabbit PR threads and apply per-fix approval against the local head. |

## ponytail
| Skill | Description |
|---|---|
| `ponytail` | Lazy senior dev mode: smallest change that fully solves the task; three compression levels (lite / full / ultra). |
| `ponytail-audit` | One-shot whole-repo quality audit: bugs, security, load risks, slow paths, bloat — ranked, changes nothing. |
| `ponytail-review` | Quality review of a change: correctness, safety, load, test coverage, speed, leanness — reads connected code. |
| `ponytail-debt` | List every `shortcut:` / `ponytail:` comment in the repo as a debt ledger; one-shot, changes nothing. |
| `ponytail-gain` | Show measured token / cost / speed savings from the ponytail benchmark; one-shot display. |
| `ponytail-help` | Quick-reference card for all ponytail levels and commands. |

## caveman
| Skill | Description |
|---|---|
| `caveman` | Terse caveman voice in chat replies: answer first, fluff gone, all technical facts kept. |
| `caveman-commit` | Write a Conventional Commits message compressed to intent only (`/commit`). |
| `caveman-compress` | Compress a memory file (CLAUDE.md, todo list) into caveman format and keep a readable backup. |
| `caveman-review` | One-line-per-finding compressed code review with location, problem, and fix. |
| `caveman-stats` | Show token usage and mode attribution for the current session (`/caveman-stats`). |
| `caveman-help` | Quick-reference card for all caveman skills and commands. |
| `cavecrew` | Route investigation / small edit / diff-review work to the matching cavecrew subagent to save main context. |
| `ultracave` | Maximum compression: fragments, one word when enough — invoke with `/ultracave`. |
| `megacave` | Classical Chinese 文言文 register — invoke with `/megacave`. |

## gemini-api
| Skill | Description |
|---|---|
| `gemini-api-dev` | Write Gemini API code: text generation, chat, multimodal, image/video/TTS, function calling, structured output. |
| `gemini-live-api-dev` | Build real-time bidirectional streaming apps with the Gemini Live API (audio/video, VAD, ephemeral tokens). |
| `gemini-omni-flash-api` | Generative video editing and text-to-video using Gemini Omni 1.1 Flash via the google-genai SDK. |

---
> **Usage rules** (from `docs/AGENTS.md`):
> - **coderabbit** — run at the review gate after every chunk.
> - **gemini-api** — Phase 2 chatbot work only; do not add AI features to MVP.
> - **caveman** — terse chat replies only; never apply to code, docs, or copy.
> - **ponytail** — use a skill when its description matches the task; name the skill used in the report.
