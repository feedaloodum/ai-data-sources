# PRD: AI Data Sources — Cribl App

## Problem Statement

AI adoption has exploded across development teams, but observability into what AI agents and providers actually produce is fragmented and poorly documented. An SE or customer asking "I use Cursor with Azure OpenAI — what observability data exists, and how should I tier it?" has no single reference to turn to. Each agent has different local file formats, each provider has different APIs and log structures, and each gateway has its own telemetry model. There's no unified catalog that shows what data exists, where it lives, what it looks like, and how to think about storing it.

## Solution

A Cribl App that serves as a **reference catalog** of observability data sources for AI agents, providers, and gateways. Users browse by agent, provider, gateway, or agent+provider pair to discover what data exists, see example events, and get tiering suggestions using a Cribl-native 4-tier model. The app is educational — it documents what data exists and how to think about it, not how to deploy pipelines.

## User Stories

### Navigation & Discovery

1. As a Cribl SE, I want to browse all AI agents that produce observability data, so that I can understand what's available across the agent landscape
2. As a Cribl SE, I want to browse all AI providers that produce observability data, so that I can understand what's available across the provider landscape
3. As a Cribl SE, I want to browse all AI gateways that produce observability data, so that I can understand what's available across the gateway landscape
4. As a Cribl SE, I want to browse agent+provider pairs, so that I can see the combined data flow for a specific stack combination
5. As a Cribl customer, I want to click on a specific agent (e.g., "Claude Code") and see all data sources it produces, so that I understand what I can collect from my developer workstations
6. As a Cribl customer, I want to click on a specific provider (e.g., "AWS Bedrock") and see all data sources it produces, so that I understand what I can collect from my cloud provider
7. As a Cribl customer, I want to click on a specific gateway (e.g., "LiteLLM") and see all data sources it produces, so that I understand what I can collect from my AI proxy
8. As a Cribl customer, I want to click on a specific pair (e.g., "Claude Code + AWS Bedrock") and see the full data flow architecture, so that I understand how agent-side and provider-side data sources fit together
9. As a Cribl customer, I want to navigate from a pair view to the standalone agent or provider view, so that I can drill into one side independently
10. As a Cribl customer, I want to navigate from a standalone agent view to its available pairs, so that I can see which provider combinations are documented
11. As a Cribl customer, I want to see a "coming soon" entry for Claude Desktop, so that I know it's planned and what research is needed to add it

### Architecture Diagrams

12. As a Cribl customer, I want to see an interactive architecture diagram for each pair, so that I can visually understand the data flow from agent to provider to Cribl to destination tiers
13. As a Cribl customer, I want to click on any component in the architecture diagram, so that I can see example events for that data source
14. As a Cribl customer, I want to see different event format tabs (Raw JSON, OTel, KQL) for each source, so that I can understand the same data in different representations
15. As a Cribl customer, I want to see an architecture diagram in the standalone agent view with a generic provider placeholder, so that I understand the agent's data flow without committing to a specific provider
16. As a Cribl customer, I want to see an architecture diagram in the standalone provider view with a generic agent placeholder, so that I understand the provider's data flow without committing to a specific agent
17. As a Cribl customer, I want to see an architecture diagram in the standalone gateway view with generic agent and provider placeholders, so that I understand the gateway's data flow as middleware
18. As a Cribl customer, I want the architecture diagrams to use Cribl's Capra design system, so that the app looks native to Cribl

### Source Cards & Example Events

19. As a Cribl customer, I want to see a source card for each data source in a view, so that I can understand what the source is, how Cribl collects it, and what it looks like
20. As a Cribl customer, I want to see the collection method (Cribl Edge vs Cribl Stream) for each source, so that I know which Cribl product collects it
21. As a Cribl customer, I want to see real example events (not fabricated) for each source, so that I can verify the data schema and field names
22. As a Cribl customer, I want to see example events in multiple formats (raw JSON, OTel spans, KQL queries) where applicable, so that I can understand the data in the format I'll actually work with
23. As a Cribl customer, I want to see tool calls and MCP server calls as distinct sources in the agent view, so that I understand the full scope of what the agent produces beyond just model interactions
24. As a Cribl customer, I want to see honest labeling for sources with limitations (e.g., "Cursor internal OTel — not user-configurable, use Hooks instead"), so that I'm not misled about what's collectible

### Data Tiering

25. As a Cribl customer, I want to see a tiering suggestion for every source, so that I know which Cribl destination(s) the data should land in
26. As a Cribl customer, I want to see which specific fields/data elements go to which tier, so that I can plan my routing strategy at the field level
27. As a Cribl customer, I want to see the 4-verb model (Investigate, Monitor, Prove, Keep) explaining why each tier is appropriate, so that I understand the reasoning behind the suggestion
28. As a Cribl customer, I want to see a tiering summary table in each view showing all sources × all tiers, so that I can see the complete tiering picture at a glance
29. As a Cribl customer, I want pair-level tip notes where relevant (e.g., "Bedrock S3 already captures full prompts — consider dropping content from JSONL hot tier"), so that I get pair-specific optimization advice
30. As a Cribl customer, I want tiering suggestions to be consistent for the same source across different views, so that I'm not confused by contradictory recommendations

### Specific Agent Sources

31. As a Cribl customer, I want to see Claude Code's JSONL session sources with the exact file path (`~/.claude/projects/*/sessions/*.jsonl`), so that I can configure Cribl Edge to tail them
32. As a Cribl customer, I want to see Claude Code's OTel source with configuration details, so that I can configure an OTel receiver
33. As a Cribl customer, I want to see Codex CLI's session rollout files with the exact path pattern (`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`), so that I can configure Cribl Edge to tail them
34. As a Cribl customer, I want to see Codex CLI's OTel configuration (`[otel]` in `~/.codex/config.toml`), so that I can enable OTLP export to Cribl Edge
35. As a Cribl customer, I want to see Cursor's Hooks system with the 20+ lifecycle events listed, so that I understand what telemetry I can collect via hooks
36. As a Cribl customer, I want to see Cursor's Analytics API endpoints, so that I can configure Cribl Stream to poll for aggregate usage data
37. As a Cribl customer, I want to see ChatGPT Desktop's Codex engine sources, so that I understand it shares the same `~/.codex/` infrastructure as Codex CLI

### Specific Provider Sources

38. As a Cribl customer, I want to see AWS Bedrock's S3 invocation log schema, so that I can configure Cribl Stream S3 source
39. As a Cribl customer, I want to see AWS Bedrock's CloudWatch metrics with the available metric names, so that I can configure metric collection
40. As a Cribl customer, I want to see Anthropic's Admin API endpoints with usage and cost report paths, so that I can configure Cribl Stream API polling
41. As a Cribl customer, I want to see Anthropic's Compliance API with the 400+ activity types, so that I can understand what audit data is available
42. As a Cribl customer, I want to see OpenAI's Admin API audit log endpoints with the 140+ event types, so that I can configure audit log collection
43. As a Cribl customer, I want to see Azure AI Foundry's 5 diagnostic log categories, so that I know what's available in AzureDiagnostics
44. As a Cribl customer, I want to see GCP Vertex AI's 4 audit log types with the specific operations (endpoints.predict, etc.), so that I know what Data Access logs to enable

### Specific Gateway Sources

45. As a Cribl customer, I want to see LiteLLM's access log schema (LiteLLM_SpendLogs table), so that I can configure database or S3 collection
46. As a Cribl customer, I want to see LiteLLM's OTel support with the gen_ai.* attributes, so that I can configure OTLP collection
47. As a Cribl customer, I want to see LiteLLM's Prometheus metrics list, so that I can configure metric scraping
48. As a Cribl customer, I want to see Kong's ai-proxy plugin logging fields (ai.proxy.*), so that I can configure log collection
49. As a Cribl customer, I want to see Kong's OTel plugin with AI metrics enabled, so that I can configure OTel collection
50. As a Cribl customer, I want to see Kong's Prometheus AI metrics (ai_llm_*), so that I can configure metric scraping

## Implementation Decisions

### Modules

The app is organized into the following modules, classified by depth:

#### DEEP modules (primary testing targets)

1. **Catalog Index** (`src/data/catalog.ts`) — Pure functions for querying the source catalog: getAgentById, getProviderById, getGatewayById, getPairById, getPairsForAgent, getPairsForProvider, listAllAgents, listAllProviders, listAllGateways, listAllPairs. Simple interface, testable in isolation, rarely changes.

2. **Diagram Layout** (`src/components/diagramLayout.ts`) — Pure functions for diagram node positioning, path computation between nodes, edge routing (orthogonal, curved, straight), layer rectangle placement, and tier destination positioning. Takes a diagram config, returns computed positions and paths. No React dependency.

#### MEDIUM modules (test extracted logic only)

3. **Architecture Diagram** (`src/components/ArchitectureDiagram.tsx`) — Interactive SVG component. Contains both logic (which nodes to render, how to handle clicks) and presentation (SVG rendering). The logic is extracted into `diagramLayout.ts` (DEEP) and tested there. The React component itself is SHALLOW — it renders from layout output.

#### DATA modules (tested implicitly through consumers)

4. **Agent Sources** (`src/data/sources/agentSources.ts`) — Static source definitions for Claude Code (JSONL, OTel, tool calls, MCP calls), Codex CLI (rollouts, SQLite state, OTel, tool calls, MCP calls), Cursor (Hooks, Analytics API, AI Code Tracking, audit log streaming, state.vscdb, workspaceStorage, internal OTel footnote), ChatGPT Desktop (Codex engine, OTel, local storage).

5. **Provider Sources** (`src/data/sources/providerSources.ts`) — Static source definitions for AWS Bedrock (S3 invocation logs, CloudWatch, CloudTrail), Anthropic API (Admin API, Compliance API), OpenAI API (Admin API, Compliance Logs Platform), Azure AI Foundry (diagnostic logs, metrics), GCP Vertex AI (audit logs, Cloud Monitoring, Model Monitoring).

6. **Gateway Sources** (`src/data/sources/gatewaySources.ts`) — Static source definitions for LiteLLM (access logs, spend tracking, OTel, Prometheus, callbacks, Admin API) and Kong AI Gateway (AI plugin logging, rate limiting, OTel, Prometheus, 24+ AI plugins).

7. **Tiering Definitions** (`src/data/tiering.ts`) — The 4-tier model definitions (Lakehouse Engine/Monitor, Metrics Store/Monitor, Cribl Lake/Prove, Archive/Keep), tiering suggestion type, and helper functions for tiering display.

8. **Diagram Types** (`src/components/diagramTypes.ts`) — TypeScript types for diagram nodes, edges, layers, and configurations per view type (pair, agent, provider, gateway).

9. **Pair Definitions** (`src/data/pairs.ts`) — Static pair definitions linking agents to providers, including pair-level tip notes.

#### SHALLOW modules (presentational, no unit tests)

10. **Landing Page** (`src/pages/LandingPage.tsx`) — Four browse sections with cards for each category.
11. **Pair View** (`src/pages/PairView.tsx`) — Orchestrates diagram, source cards, tiering table, tip notes for a pair.
12. **Agent View** (`src/pages/AgentView.tsx`) — Standalone agent page with diagram, sources, available pairs.
13. **Provider View** (`src/pages/ProviderView.tsx`) — Standalone provider page with diagram, sources, available pairs.
14. **Gateway View** (`src/pages/GatewayView.tsx`) — Standalone gateway page with diagram, sources.
15. **Event Modal** (`src/components/EventModal.tsx`) — Modal with tabs showing example events for a clicked source.
16. **Source Card** (`src/components/SourceCard.tsx`) — Card showing source name, description, collection method badge, tiering badges.
17. **Tiering Table** (`src/components/TieringTable.tsx`) — Table showing sources × tiers with field-level routing.
18. **App Router** (`src/App.tsx`) — React Router setup with basename for Cribl platform integration.

### Architecture decisions

- **React Router 7** for navigation with `basename={window.CRIBL_BASE_PATH}` for Cribl platform iframe mounting
- **Capra design system** for all UI — `@capra/core` components, `@capra/icons` icons, `token()` for design tokens
- **No dark mode** — Capra light theme only (unlike the source `claude-bedrock` diagram which was dark)
- **Interactive SVG** — custom SVG component (not a charting library) for the architecture diagram, matching the `claude-bedrock` pattern but re-skinned to Capra tokens
- **Static data only** — all source definitions, example events, and tiering suggestions are static TypeScript data. No API calls, no KV store, no external requests. The app is a pure reference catalog.
- **No config/proxies/policies needed** — the app doesn't call any external APIs or Cribl APIs. `config/proxies.yml` and `config/policies.yml` remain empty/commented.
- **TypeScript project references** — the scaffold uses `tsc -b` with project references; the TS5112 warning is harmless (per existing TDD skill pitfall notes)

### Diagram rendering approach

The architecture diagram is a custom SVG component, not a third-party graph library. This matches the `claude-bedrock` pattern and allows:
- Full control over Capra token styling (colors, borders, fonts via `token()`)
- Click-to-open-modal interactivity on individual nodes
- Custom path routing for data flow arrows
- Layer rectangles for visual grouping (agent area, provider area, Cribl pipeline, destinations)

The layout logic (node positions, path computation) is extracted into pure functions (`diagramLayout.ts`) for testability. The React component renders SVG elements from the computed layout.

## Testing Decisions

### What makes a good test

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification.

- **DEEP modules** — tested via direct unit tests with deterministic inputs/outputs
- **MEDIUM modules** — logic extracted into pure functions, tested as DEEP. The React component itself is not tested.
- **DATA modules** — tested implicitly through the DEEP modules that consume them (e.g., catalog tests verify that source data is correctly structured)
- **SHALLOW modules** — not unit tested. Verified manually or via integration if needed.

### Modules to be tested

1. **Catalog Index** (`src/data/catalog.ts`) — DEEP
   - getAgentById returns correct agent with sources
   - getProviderById returns correct provider with sources
   - getGatewayById returns correct gateway with sources
   - getPairById returns correct pair with agent + provider
   - getPairsForAgent returns all pairs containing that agent
   - getPairsForProvider returns all pairs containing that provider
   - listAllAgents returns all 4 V1 agents
   - listAllProviders returns all 5 V1 providers
   - listAllGateways returns both V1 gateways
   - listAllPairs returns all 5 V1 pairs
   - Claude Desktop is returned with "coming soon" status

2. **Diagram Layout** (`src/components/diagramLayout.ts`) — DEEP
   - Node positions are computed correctly for pair view (agent left, provider right, Edge/Stream middle, tiers bottom)
   - Node positions are computed correctly for standalone views (generic placeholder on missing side)
   - Path computation produces valid SVG path strings between nodes
   - Edge routing handles orthogonal (L-shaped), straight, and curved paths
   - Layer rectangles are positioned to contain their child nodes
   - Tier destination nodes are positioned in a row at the bottom

### Prior art

The `claude-bedrock` app (`/Users/danschmitz/workspace/cribl/cribl-apps/claude-bedrock/`) has similar patterns:
- `src/data/graphData.ts` — node/edge definitions and layout (analogous to our catalog + diagramLayout)
- `src/data/sources.ts` — source definitions with example events (analogous to our agentSources)
- `src/components/ArchitectureDiagram.tsx` — SVG rendering (analogous to our ArchitectureDiagram)
- `src/data/graphData.test.ts` and `src/data/causalPath.test.ts` — tests for graph logic

## Out of Scope

- Claude Desktop agent (coming soon — promotion checklist in CONTEXT.md)
- Additional agents (Windsurf, GitHub Copilot, Aider, etc.)
- Additional providers (Mistral, Cohere, local models via Ollama)
- Additional gateways (beyond LiteLLM and Kong)
- Pair views that include gateways (gateway-inclusive triples)
- MCP servers as a standalone browse category
- Config recipes / pipeline deployment
- Verification queries
- Live data collection or real-time dashboards
- Agent/provider installation guides
- External API calls (the app is fully static)
- Cribl API integration (no KV store, no policies, no proxies needed)

## Further Notes

- The attached diagram (`architecture__2_.html` from `claude-bedrock`) serves as the visual template — same data flow pattern, re-skinned from dark mode to Capra
- All research docs are in `research/` directory at the repo root
- The `claude-bedrock` app's source/destination data structures provide a proven pattern for structuring source definitions with example event tabs
- The app name in `package.json` has a typo: "AI Data Soruces" (should be "Sources") — needs fixing
- Codex CLI was cloned to `ai-data-sources/codex/` by a research subagent — should be removed from the repo (it's the full openai/codex source, not needed for the app)