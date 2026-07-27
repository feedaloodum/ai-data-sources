import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Text, Pill } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import {
  listAllAgents,
  listAllProviders,
  listAllGateways,
  listAllPairs,
  getAgentById,
  getProviderById,
} from '../data/catalog';
import type { Agent, Provider, Gateway, Pair } from '../types';

// ── Style helpers ─────────────────────────────────────────────────────────────
// Inline styles using design tokens. Capra components discourage className overrides,
// so we use wrapper divs with inline `token()` values for layout. No raw CSS variables.

const pageStyle: CSSProperties = {
  padding: `${token('spacing.xl')} ${token('spacing.lg')}`,
  maxWidth: '1200px',
  margin: '0 auto',
};

const sectionStyle: CSSProperties = {
  marginBottom: token('spacing.2xl'),
};

const sectionHeadingStyle: CSSProperties = {
  marginBottom: token('spacing.lg'),
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: token('spacing.lg'),
};

const cardBodyStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: token('spacing.sm'),
  height: '100%',
};

const cardDescriptionStyle: CSSProperties = {
  flexGrow: 1,
};

const comingSoonBadgeStyle: CSSProperties = {
  alignSelf: 'flex-start',
};

const cardHeaderRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: token('spacing.sm'),
};

// ── Sub-components ────────────────────────────────────────────────────────────

function PairCard({ pair }: { pair: Pair }) {
  const agent = getAgentById(pair.agentId);
  const provider = getProviderById(pair.providerId);
  const title = `${agent?.name ?? pair.agentId} + ${provider?.name ?? pair.providerId}`;
  return (
    <Link to={`/pair/${pair.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>
      <Card>
        <Card.Header>
          <Card.Title>{title}</Card.Title>
        </Card.Header>
        <Card.Content>
          <Text color="subtle">Agent + Provider pair with combined tiering tips.</Text>
        </Card.Content>
      </Card>
    </Link>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const [showChecklist, setShowChecklist] = useState(false);
  const isComingSoon = agent.status === 'coming-soon';

  const card = (
    <Card>
      <Card.Header>
        <div style={cardHeaderRowStyle}>
          <Card.Title>{agent.name}</Card.Title>
          {isComingSoon && (
            <div style={comingSoonBadgeStyle}>
              <Pill appearance="info" variant="muted">Coming Soon</Pill>
            </div>
          )}
        </div>
      </Card.Header>
      <Card.Content>
        <div style={cardBodyStyle}>
          <div style={cardDescriptionStyle}>
            <Text>{agent.description}</Text>
          </div>
          {isComingSoon && agent.promotionChecklist && (
            <div>
              <Text
                as="button"
                variant="body-sm-normal"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowChecklist(!showChecklist);
                }}
              >
                {showChecklist ? '▼ Hide' : '▶ Show'} promotion checklist
              </Text>
              {showChecklist && (
                <ol style={{ marginTop: token('spacing.sm'), paddingLeft: token('spacing.lg'), fontSize: '0.8rem', color: token('color.foreground.subtle') }}>
                  {agent.promotionChecklist.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  );

  if (isComingSoon) {
    // Dimmed, non-navigable card for coming-soon agents. But allow interaction
    // with the promotion checklist toggle.
    return (
      <div
        style={{
          opacity: '0.7',
          cursor: 'default',
          height: '100%',
        }}
      >
        {card}
      </div>
    );
  }

  return <Link to={`/agent/${agent.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>{card}</Link>;
}

function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link to={`/provider/${provider.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>
      <Card>
        <Card.Header>
          <Card.Title>{provider.name}</Card.Title>
        </Card.Header>
        <Card.Content>
          <div style={cardBodyStyle}>
            <div style={cardDescriptionStyle}>
              <Text color="subtle">{provider.description}</Text>
            </div>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}

function GatewayCard({ gateway }: { gateway: Gateway }) {
  return (
    <Link to={`/gateway/${gateway.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>
      <Card>
        <Card.Header>
          <Card.Title>{gateway.name}</Card.Title>
        </Card.Header>
        <Card.Content>
          <div style={cardBodyStyle}>
            <div style={cardDescriptionStyle}>
              <Text>{gateway.description}</Text>
            </div>
          </div>
        </Card.Content>
      </Card>
    </Link>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeadingStyle}>
        <Text as="h2" variant="heading-md">{title}</Text>
      </div>
      <div style={gridStyle}>{children}</div>
    </section>
  );
}

// ── LandingPage ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const pairs = listAllPairs();
  const agents = listAllAgents();
  const providers = listAllProviders();
  const gateways = listAllGateways();

  return (
    <div style={pageStyle}>
      <div style={{ marginBottom: token('spacing.2xl') }}>
        <Text as="h1" variant="heading-xl">AI Data Sources</Text>
        <Text color="subtle">Reference catalog of observability data sources for AI agents, providers, and gateways.</Text>
      </div>

      <Section title="Agent + Provider Pairs">
        {pairs.map((pair) => (
          <PairCard key={pair.id} pair={pair} />
        ))}
      </Section>

      <Section title="Agents">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </Section>

      <Section title="Providers">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </Section>

      <Section title="Gateways">
        {gateways.map((gateway) => (
          <GatewayCard key={gateway.id} gateway={gateway} />
        ))}
      </Section>
    </div>
  );
}