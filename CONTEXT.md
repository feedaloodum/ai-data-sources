# CONTEXT.md — AI Data Sources Cribl App

## Purpose

A Cribl App that serves as a **reference catalog** of observability data sources for AI agents, providers, and gateways. Educational, not operational — documents *what data exists*, *where it lives*, and *how to think about tiering it*. Does not deploy pipelines or configure Cribl resources.

## Glossary

### Core concepts

- **Agent** — An AI application that runs on a developer workstation and interacts with an LLM. Produces local data: session files, tool call logs, MCP server calls, OTel telemetry. Examples: Claude Code, Codex CLI, Cursor, ChatGPT Desktop.
- **Provider** — A cloud service that hosts LLM models and exposes an API. Produces cloud-side data: invocation logs, usage metrics, audit events, diagnostic logs. Examples: AWS Bedrock, Anthropic API, OpenAI API, Azure AI Foundry, GCP Vertex AI.
- **Gateway** — Middleware that sits between agents and providers, routing requests and producing its own observability data (access logs, spend tracking, routing metrics, rate limit events). Examples: LiteLLM, Kong AI Gateway.
- **Pair** — An agent + provider combination (e.g., "Claude Code + AWS Bedrock"). The primary unit for the pair view, showing the combined data flow from agent to provider with tiering suggestions. Pairs are always agent+provider — no gateway.
- **Standalone view** — A page for a single agent, provider, or gateway showing its data sources independently. Includes an architecture diagram with a generic placeholder for the missing side.
- **Source** — A single observability data stream from an agent, provider, or gateway. Has a collection method (Edge file tail, Edge OTel receiver, Stream S3 source, Stream HTTP, API poll), example events, and a tiering suggestion.
- **MCP Server** — Model Context Protocol server called by an agent for tool access. MCP server calls are a data source within agent views (not a separate category).
- **Hooks** — Cursor's native telemetry collection mechanism. Shell scripts that fire at 20+ agent lifecycle events (beforeSubmitPrompt, afterAgentResponse, preToolUse, postToolUse, sessionStart, sessionEnd, etc.). Can forward structured JSON to any HTTP endpoint.

### Data collection

- **Cribl Edge** — Agent-based collection at the edge (developer workstation). Used for local files (JSONL, SQLite) and OTel receivers. Appears only in agent views and pair views (agent side).
- **Cribl Stream** — Routing and processing. Collects from providers and gateways directly (S3, HTTP, syslog, API polling). Also receives from Edge downstream. Appears in all views.
- **OTel** — OpenTelemetry. Native OTLP export (HTTP/gRPC) for traces, metrics, and logs. User-configurable for Claude Code, Codex CLI, and ChatGPT Desktop (via Codex's `codex-otel` crate). Not user-configurable for Cursor (internal only, locked to Cursor's backend — use Hooks instead).

### Tiering model

- **Tier** — A Cribl destination for routed data. Each source has a tiering suggestion indicating which tier(s) it should land in.
- **4-Verb Model** — The tiering framework for this app:

| Tier | Destination | Verb | What lands here |
|------|-------------|------|-----------------|
| Hot | Cribl Lakehouse Engine | **Investigate it** | Session digests, structured event data, accelerated schema-aware search |
| Metrics | Cribl Metrics Store | **Monitor it** | Token counts, cost, latency, invocation counts, threshold alerts, trend dashboards |
| Cold | Cribl Lake | **Prove it** | Full-fidelity masked events, forensic timeline, audit compliance |
| Archive | S3 Glacier / Archive | **Keep it** | Long-term compliance retention, restore-only |

This is a **Cribl-native model** — no external SIEM. Four Cribl destinations, four verbs. Data does not age through tiers (no lifecycle progression). The tiering question is: *where should this data land at ingest?* Not: *when should it move?*

### Design system

- **Capra** — Cribl's design system. All UI uses `@capra/core` and `@capra/icons` components with `token()` for design tokens. No dark mode (unlike the source `claude-bedrock` diagram).

## Resolved Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Reference/demonstration app, not operational | Educational — shows what data exists, not how to deploy pipelines |
| 2 | Per agent+provider pair as primary unit | Data sources determined by both agent AND provider |
| 3 | No Cribl config recipes or verification queries | Reference level only — sources, example events, tiering suggestions |
| 4 | Four browse categories: Agents, Providers, Gateways, Pairs | Clean separation of concerns; gateways not in pair model |
| 5 | Every agent/provider/gateway gets a standalone page | Even with only one pairing — browse by agent or provider independently |
| 6 | Standalone views have arch diagrams with generic placeholders | Generic "Agent" or "Provider" box on the missing side |
| 7 | Agent views include tool calls and MCP server calls | Distinct source cards in agent view; folded into session data in pair view |
| 8 | Single interactive SVG per view, Capra design | Same pattern as `claude-bedrock` but re-skinned to Capra tokens |
| 9 | Cribl-native 4-tier model (no SIEM) | Lakehouse Engine, Metrics Store, Cribl Lake, Archive — all Cribl destinations |
| 10 | Gateways standalone only, not in pair model | Keeps pair model clean (agent+provider); gateway data is interesting on its own |
| 11 | MCP servers inside agent views only | Not a separate browse category for V1 |
| 12 | Azure AI Foundry as one provider | Covers Azure OpenAI as a subset; matches Microsoft branding |
| 13 | Tiering suggestions identical everywhere | Each source has one tiering suggestion that travels with it; pair views can add tip notes |
| 14 | Edge only for agent views; Stream for providers/gateways | Agents run on workstations (Edge); providers/gateways are server-side (Stream) |
| 15 | Claude Desktop deferred to V2 | Needs local data research, OTel investigation, and confirmed collection pathway |

## V1 Content Inventory

### Agents (4 + 1 coming soon)

| Agent | Key data sources | OTel? | Status |
|-------|-----------------|-------|--------|
| Claude Code | JSONL sessions (`~/.claude/projects/*/sessions/*.jsonl`), OTel, tool calls, MCP calls | ✅ Native, user-configurable | V1 |
| Codex CLI | Session rollouts (`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`), SQLite state, OTel, tool calls, MCP calls | ✅ Native via `codex-otel` crate (config.toml `[otel]`) | V1 |
| Cursor | Hooks (20+ lifecycle events), Analytics API (Enterprise), state.vscdb, workspaceStorage | ⚠️ Internal only — use Hooks instead | V1 |
| ChatGPT Desktop | Codex engine (same as Codex CLI — `~/.codex/` paths, OTel config) | ✅ Via Codex engine | V1 |
| Claude Desktop | TBD — needs local data research | TBD | Coming soon |

### Providers (5)

| Provider | Key data sources |
|----------|-----------------|
| AWS Bedrock | S3 Invocation Logs, CloudWatch Metrics, CloudTrail Audit Events |
| Anthropic API | Admin API (usage/cost/analytics — 11 endpoints), Compliance API (400+ activity types, content access) |
| OpenAI API | Admin API (audit logs 140+ event types, usage 11 endpoints, costs), Compliance Logs Platform (JSONL export) |
| Azure AI Foundry | 5 diagnostic log categories → AzureDiagnostics, 4 metric categories (HTTP, Latency, Usage, legacy) |
| GCP Vertex AI | 4 audit log types (Admin Activity, Data Access, System Event, Policy Denied), Cloud Monitoring metrics, Model Monitoring |

### Gateways (2)

| Gateway | Key data sources |
|---------|-----------------|
| LiteLLM | Access logs (PostgreSQL `LiteLLM_SpendLogs`), spend tracking (~30 tables), OTel (native OTLP, `gen_ai.*`), Prometheus (30+ metrics), callbacks (20+ integrations), Admin API |
| Kong AI Gateway | AI plugin logging (`ai-proxy` plugin, `ai.proxy.*` fields), rate limiting logs, OTel (`opentelemetry` plugin with AI metrics), Prometheus (`ai_llm_*` metrics), 24+ AI plugins |

### Pairs (5)

1. Claude Code + AWS Bedrock
2. Claude Code + Anthropic API
3. Cursor + Azure AI Foundry
4. Codex CLI + OpenAI API
5. ChatGPT Desktop + OpenAI API

## Claude Desktop Promotion Checklist

To move Claude Desktop from "coming soon" to V1:

1. **Local data research** — Determine Claude Desktop's local storage format and paths. Is it Electron app storage (LevelDB/IndexedDB)? Does it share session infrastructure with Claude Code's JSONL format? Inspect the app on a machine where it's installed.
2. **OTel support** — Determine if Claude Desktop has native OTel support, or if it uses shared Anthropic telemetry infrastructure with Claude Code.
3. **At least one confirmed collection pathway** — Either local files that Cribl Edge can tail, or OTel that Cribl Edge can receive, or an API that Cribl Stream can poll.
4. **Example events** — At least one real example event from each confirmed source, with schema/field documentation.
5. **Pair identification** — At least one provider pairing (likely "Claude Desktop + Anthropic API").

## Architecture

```
Landing Page
├── Agents (browse → standalone agent view)
│   ├── Claude Code
│   ├── Codex CLI
│   ├── Cursor
│   ├── ChatGPT Desktop
│   └── Claude Desktop (coming soon)
├── Providers (browse → standalone provider view)
│   ├── AWS Bedrock
│   ├── Anthropic API
│   ├── OpenAI API
│   ├── Azure AI Foundry
│   └── GCP Vertex AI
├── Gateways (browse → standalone gateway view)
│   ├── LiteLLM
│   └── Kong AI Gateway
└── Pairs (browse → pair view)
    ├── Claude Code + AWS Bedrock
    ├── Claude Code + Anthropic API
    ├── Cursor + Azure AI Foundry
    ├── Codex CLI + OpenAI API
    └── ChatGPT Desktop + OpenAI API
```

Cross-linking: pair views link to their agent and provider standalone views. Standalone views list available pairs for that agent/provider.

## Source

Adapted from the `claude-bedrock` Cribl App (also by Dan Schmitz). Architecture diagram pattern reused, re-skinned from dark mode to Capra design tokens.