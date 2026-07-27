import { useParams, Link } from 'react-router-dom';
import { Card, Text, Pill } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { getAgentById, getProviderById, getPairsForAgent } from '../data/catalog';
import { buildAgentConfig, buildSourcesMap } from '../components/diagramBuilders';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { SourceCard } from '../components/SourceCard';
import { TieringTable } from '../components/TieringTable';

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

const sourceGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: token('spacing.lg'),
};

const titleLinkStyle: CSSProperties = {
  color: 'inherit',
  textDecoration: 'none',
};

const comingSoonBadgeStyle: CSSProperties = {
  alignSelf: 'flex-start',
};

const headerRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: token('spacing.sm'),
};

const pairListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: token('spacing.sm'),
};

const pairLinkStyle: CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
};

const checklistStyle: CSSProperties = {
  marginTop: token('spacing.sm'),
  paddingLeft: token('spacing.lg'),
  fontSize: '0.85rem',
  color: token('color.foreground.subtle'),
};

export default function AgentView() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Agent not found</Text>
        <Text color="subtle">No agent id was provided.</Text>
      </div>
    );
  }

  const agent = getAgentById(id);

  if (!agent) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Agent not found</Text>
        <Text color="subtle">No agent exists with id "{id}".</Text>
        <div style={{ marginTop: token('spacing.lg') }}>
          <Link to="/" style={titleLinkStyle}>
            <Text variant="body-sm-semibold" color="accent">← Back to catalog</Text>
          </Link>
        </div>
      </div>
    );
  }

  // Coming-soon agent: show description + promotion checklist, no diagram
  if (agent.status === 'coming-soon') {
    return (
      <div style={pageStyle}>
        <section style={sectionStyle}>
          <div style={headerRowStyle}>
            <Text as="h1" variant="heading-xl">{agent.name}</Text>
            <div style={comingSoonBadgeStyle}>
              <Pill appearance="info" variant="muted">Coming Soon</Pill>
            </div>
          </div>
          <Text color="subtle">{agent.description}</Text>
        </section>

        {agent.promotionChecklist && agent.promotionChecklist.length > 0 && (
          <section style={sectionStyle}>
            <div style={sectionHeadingStyle}>
              <Text as="h2" variant="heading-md">Promotion Checklist</Text>
            </div>
            <Card>
              <Card.Content>
                <Text color="subtle">
                  This agent is under investigation. The following items need to be completed
                  before it can be promoted to V1:
                </Text>
                <ol style={checklistStyle}>
                  {agent.promotionChecklist.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                  ))}
                </ol>
              </Card.Content>
            </Card>
          </section>
        )}
      </div>
    );
  }

  const config = buildAgentConfig(agent);
  const sourcesMap = buildSourcesMap(agent.sources);

  const pairs = getPairsForAgent(id);

  return (
    <div style={pageStyle}>
      <section style={sectionStyle}>
        <Text as="h1" variant="heading-xl">{agent.name}</Text>
        <Text color="subtle">{agent.description}</Text>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Architecture</Text>
        </div>
        <Card>
          <Card.Content>
            <ArchitectureDiagram config={config} sources={sourcesMap} />
          </Card.Content>
        </Card>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Sources</Text>
        </div>
        <div style={sourceGridStyle}>
          {agent.sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Tiering Matrix</Text>
        </div>
        <TieringTable sources={agent.sources} />
      </section>

      {pairs.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <Text as="h2" variant="heading-md">Paired with</Text>
          </div>
          <div style={pairListStyle}>
            {pairs.map((pair) => {
              const provider = getProviderById(pair.providerId);
              const pairTitle = `${agent.name} + ${provider?.name ?? pair.providerId}`;
              return (
                <Link
                  key={pair.id}
                  to={`/pair/${pair.id}`}
                  style={pairLinkStyle}
                >
                  <Card>
                    <Card.Header>
                      <Card.Title>{pairTitle}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <Text color="subtle">View combined tiering tips for this pair.</Text>
                    </Card.Content>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}