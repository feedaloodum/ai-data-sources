import { Card, Text, Pill } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { TIERS, TIER_ORDER } from '../data/tiering';

// Agent-side vs provider-side collection: what each vantage point sees, where it
// wins, where it falls short, and how the two combine into a tiering strategy.

interface Vantage {
  key: 'agent' | 'provider';
  title: string;
  tagline: string;
  appearance: 'info' | 'warning';
  available: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
}

const VANTAGES: Vantage[] = [
  {
    key: 'agent',
    title: 'Agent-side collection',
    tagline: 'Instrument the client where the work happens',
    appearance: 'info',
    available: [
      'Prompts, completions, and full conversation turns',
      'Tool calls, file edits, shell commands, and MCP server activity',
      'Developer, host, os.user, project, and working directory',
      'OTel gen_ai.* spans: token usage, cost, TTFT, end-to-end latency',
      'Local session files (JSONL, SQLite rollouts) and hooks telemetry',
    ],
    pros: [
      'Only place that sees who ran what, on which machine, against which repo',
      'Provider-agnostic — one schema across every model backend the agent calls',
      'Captures local tool/MCP steps that never reach a model API',
      'Real client-side latency, retries, and failures',
    ],
    cons: [
      'Requires deploying/collecting on every developer machine or fleet',
      'Coverage depends on the agent exposing telemetry (some are locked or undocumented)',
      'Higher volume — raw sessions and spans can be noisy without shaping',
    ],
    useCases: [
      'Developer productivity and adoption analytics',
      'Security review of tool/command/file activity',
      'Full-fidelity session reconstruction and prompt audit',
    ],
  },
  {
    key: 'provider',
    title: 'Provider-side collection',
    tagline: 'Pull from the model backend and its cloud logs',
    appearance: 'warning',
    available: [
      'Server-side invocation logs with request/response payloads (where enabled)',
      'Authoritative token counts, cost, and billing per API key',
      'Model id, operation, service tier, and status codes',
      'Cloud audit trails: who (by key/principal) called the API, when, from where',
      'Platform metrics: request rate, error rate, latency at the API boundary',
    ],
    pros: [
      'Authoritative for cost and billing — the source of truth',
      'No per-endpoint deployment — centralized at the provider/cloud',
      'Consistent regardless of which client made the call',
      'Strong for compliance and org-wide spend governance',
    ],
    cons: [
      'No developer, host, or repo attribution — only an API key or principal',
      'Blind to local tool calls, file edits, and MCP activity',
      'Per-provider log formats to normalize; some payloads are opt-in or redacted',
      'Stops at the API boundary — no client-side latency or retries',
    ],
    useCases: [
      'Cost governance, chargeback, and spend anomaly detection',
      'Compliance and audit trails per API key / org',
      'Provider SLA and error-rate monitoring',
    ],
  },
];

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: token('spacing.lg'),
};

const columnHeaderStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: token('spacing.xs'),
  marginBottom: token('spacing.sm'),
};

const blockStyle: CSSProperties = {
  marginTop: token('spacing.md'),
};

const listStyle: CSSProperties = {
  margin: `${token('spacing.xs')} 0 0`,
  paddingLeft: token('spacing.lg'),
  display: 'flex',
  flexDirection: 'column',
  gap: token('spacing.xs'),
};

const introStyle: CSSProperties = {
  maxWidth: '80ch',
  marginBottom: token('spacing.lg'),
};

// Which vantage best feeds each destination tier, and why.
const TIER_STRATEGY: Record<string, { source: string; note: string }> = {
  'lakehouse-engine': {
    source: 'Agent-side',
    note: 'Session digests, tool patterns, and per-developer activity for investigation.',
  },
  'metrics-store': {
    source: 'Both',
    note: 'Agent OTel for client latency and tool metrics; provider metrics for authoritative cost and request/error rates.',
  },
  'cribl-lake': {
    source: 'Both',
    note: 'Full-fidelity masked events — agent sessions for content, provider logs for the billed audit trail.',
  },
  archive: {
    source: 'Provider-side',
    note: 'Long-term compliance retention of authoritative invocation and audit records.',
  },
};

function Column({ v }: { v: Vantage }) {
  return (
    <Card>
      <Card.Content>
        <div style={columnHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: token('spacing.sm') }}>
            <Text variant="heading-sm">{v.title}</Text>
            <Pill appearance={v.appearance} variant="muted">
              {v.key === 'agent' ? 'Client' : 'Backend'}
            </Pill>
          </div>
          <Text variant="body-sm-normal" color="subtle">{v.tagline}</Text>
        </div>

        <div style={blockStyle}>
          <Text variant="body-sm-semibold">Data generally available</Text>
          <ul style={listStyle}>
            {v.available.map((item, i) => (
              <li key={i}><Text variant="body-sm-normal" color="subtle">{item}</Text></li>
            ))}
          </ul>
        </div>

        <div style={blockStyle}>
          <Text variant="body-sm-semibold" color="success">Pros</Text>
          <ul style={listStyle}>
            {v.pros.map((item, i) => (
              <li key={i}><Text variant="body-sm-normal" color="subtle">{item}</Text></li>
            ))}
          </ul>
        </div>

        <div style={blockStyle}>
          <Text variant="body-sm-semibold" color="attention">Cons</Text>
          <ul style={listStyle}>
            {v.cons.map((item, i) => (
              <li key={i}><Text variant="body-sm-normal" color="subtle">{item}</Text></li>
            ))}
          </ul>
        </div>

        <div style={blockStyle}>
          <Text variant="body-sm-semibold">Use cases it solves</Text>
          <ul style={listStyle}>
            {v.useCases.map((item, i) => (
              <li key={i}><Text variant="body-sm-normal" color="subtle">{item}</Text></li>
            ))}
          </ul>
        </div>
      </Card.Content>
    </Card>
  );
}

export function CollectionComparison() {
  return (
    <div>
      <div style={introStyle}>
        <Text variant="body-md-normal" color="subtle">
          The same AI request looks completely different depending on where you
          observe it. Collecting at the agent captures local intent and behavior;
          collecting at the provider captures the authoritative, billed record.
          They are complementary — the strongest programs collect both and route
          each to the tier that fits.
        </Text>
      </div>

      <div style={gridStyle}>
        {VANTAGES.map((v) => <Column key={v.key} v={v} />)}
      </div>

      <div style={{ marginTop: token('spacing.lg') }}>
        <Card>
          <Card.Content>
            <Text variant="heading-sm">Tiering strategy</Text>
            <div style={{ marginTop: token('spacing.xs'), marginBottom: token('spacing.md') }}>
              <Text variant="body-sm-normal" color="subtle">
                Route each vantage to the destination that matches its value and volume.
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: token('spacing.md') }}>
              {TIER_ORDER.map((tierId) => {
                const tier = TIERS[tierId];
                const strat = TIER_STRATEGY[tierId];
                return (
                  <div key={tierId} style={{ display: 'flex', flexDirection: 'column', gap: token('spacing.xs') }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: token('spacing.sm') }}>
                      <Text variant="body-sm-semibold">{tier.name}</Text>
                      <Pill appearance="info" variant="muted">{tier.verb}</Pill>
                      <Pill appearance="default" variant="muted">{strat.source}</Pill>
                    </div>
                    <Text variant="body-sm-normal" color="subtle">{strat.note}</Text>
                  </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
