# ADR-0001: Cribl-Native 4-Tier Data Model (No SIEM)

## Status

Accepted — 2026-07-27

## Context

The predecessor `claude-bedrock` app used a 4-tier model that included a SIEM as the hot tier:

| Tier | Destination | Verb |
|------|-------------|------|
| Hot | SIEM (Splunk, Sentinel, etc.) | Detect it |
| Warm | Lakehouse Engine | Investigate it |
| Cold | Cribl Lake | Prove it |
| Archive | S3 Glacier | Keep it |

This model assumed the customer already has a SIEM and routes detection-critical data there. It externalized the hot tier to a third-party platform.

For the `ai-data-sources` app, this doesn't fit:

1. **Different audience** — This is a Cribl reference app, not a "route to your SIEM" app. The model should showcase Cribl's own capabilities.
2. **Cribl Metrics Store** — Cribl now has a dedicated metrics store, which didn't exist when `claude-bedrock` was built. The SIEM tier was doing double duty (detection alerts + metrics dashboards); these are now separable.
3. **"Detect it" was misleading for SIEM** — SIEM detection is batch search at short intervals, not streaming. The verb "Monitor it" is more accurate for what a metrics store does (threshold alerts, trend dashboards, cost spike detection).
4. **Lakehouse Engine as hot, not warm** — Lakehouse Engine provides always-on accelerated search. Demoting it to "warm" undersells it. It's the primary investigation destination.

## Decision

Adopt a **Cribl-native 4-tier model** with four Cribl destinations and four verbs:

| Tier | Destination | Verb | What lands here |
|------|-------------|------|-----------------|
| Hot | Cribl Lakehouse Engine | **Investigate it** | Session digests, structured event data, accelerated schema-aware search |
| Metrics | Cribl Metrics Store | **Monitor it** | Token counts, cost, latency, invocation counts, threshold alerts, trend dashboards |
| Cold | Cribl Lake | **Prove it** | Full-fidelity masked events, forensic timeline, audit compliance |
| Archive | S3 Glacier / Archive | **Keep it** | Long-term compliance retention, restore-only |

**Key changes from `claude-bedrock`:**
- SIEM removed entirely — replaced by Metrics Store (for monitoring/alerting) and Lakehouse Engine (for investigation)
- Lakehouse Engine promoted from "warm" to "hot" — it's the primary analytics destination
- "Detect it" verb → "Monitor it" — more accurate for metrics-based alerting
- All four destinations are Cribl products — no external dependency

## Alternatives Considered

1. **Keep the SIEM model** — Rejected. The app is a Cribl reference catalog; showcasing a competitor's product as the hot tier doesn't make sense.
2. **3-tier model (merge Metrics into Lakehouse Engine)** — Rejected. Cribl has a dedicated Metrics Store; merging it back into Lakehouse Engine would ignore that product and conflate two different access patterns (metrics alerting vs. event investigation).
3. **5-tier model (add a "SIEM optional" tier)** — Rejected. Adds complexity without value for a reference app. Customers who want to route to a SIEM can do so via Cribl Stream's existing output capabilities — the app doesn't need to prescribe that.

## Consequences

- Every source's tiering suggestion must use these 4 tiers (no SIEM option)
- The Metrics Store tier applies to any metric-like data (token counts, cost, latency) — sources that were previously "session summaries for SIEM" are now "metrics for Metrics Store"
- The architecture diagram shows 4 Cribl-native destinations instead of "SIEM + LHE + Lake + Archive"
- Pair-level tip notes can still mention SIEM routing as an option ("if you have a SIEM, you could also route session summaries there") but the default model is Cribl-only