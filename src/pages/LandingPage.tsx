import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { getEntityLogo, type EntityKind } from '../components/entityLogos';
import { CollectionComparison } from '../components/CollectionComparison';

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

const titleWithLogoStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: token('spacing.sm'),
};

const logoBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: token('spacing.xs'),
  fontSize: '1.25rem',
  flexShrink: 0,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function LogoTitle({ id, kind, title }: { id: string; kind: EntityKind; title: string }) {
  const Logo = getEntityLogo(id, kind);
  return (
    <div style={titleWithLogoStyle}>
      <span style={logoBadgeStyle} aria-hidden>
        <Logo size="md" />
      </span>
      <Card.Title>{title}</Card.Title>
    </div>
  );
}

function PairCard({ pair }: { pair: Pair }) {
  const agent = getAgentById(pair.agentId);
  const provider = getProviderById(pair.providerId);
  const title = `${agent?.name ?? pair.agentId} + ${provider?.name ?? pair.providerId}`;
  const AgentLogo = getEntityLogo(pair.agentId, 'agent');
  const ProviderLogo = getEntityLogo(pair.providerId, 'provider');
  return (
    <Link to={`/pair/${pair.id}`} style={{ textDecoration: 'none', color: 'inherit', height: '100%' }}>
      <Card>
        <Card.Header>
          <div style={titleWithLogoStyle}>
            <span style={logoBadgeStyle} aria-hidden>
              <AgentLogo size="md" />
              <Text as="span" color="subtle">+</Text>
              <ProviderLogo size="md" />
            </span>
            <Card.Title>{title}</Card.Title>
          </div>
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
          <LogoTitle id={agent.id} kind="agent" title={agent.name} />
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
          <LogoTitle id={provider.id} kind="provider" title={provider.name} />
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
          <LogoTitle id={gateway.id} kind="gateway" title={gateway.name} />
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

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ ...sectionStyle, scrollMarginTop: token('spacing.2xl') }}>
      <div style={sectionHeadingStyle}>
        <Text as="h2" variant="heading-md">{title}</Text>
      </div>
      <div style={gridStyle}>{children}</div>
    </section>
  );
}

// ── LandingPage ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { hash } = useLocation();

  // react-router doesn't scroll to hash targets on its own; do it when the
  // hash changes (e.g. navigating from another page via the top nav).
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

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

      <section id="collection" style={{ ...sectionStyle, scrollMarginTop: token('spacing.2xl') }}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Agent vs. Provider Collection</Text>
        </div>
        <CollectionComparison />
      </section>

      <Section id="pairs" title="Agent + Provider Pairs">
        {pairs.map((pair) => (
          <PairCard key={pair.id} pair={pair} />
        ))}
      </Section>

      <Section id="agents" title="Agents">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </Section>

      <Section id="providers" title="Providers">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </Section>

      <Section id="gateways" title="Gateways">
        {gateways.map((gateway) => (
          <GatewayCard key={gateway.id} gateway={gateway} />
        ))}
      </Section>
    </div>
  );
}