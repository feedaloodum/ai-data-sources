import { useParams, Link } from 'react-router-dom';
import { Card, Text, Alert } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { getPairById, getAgentById, getProviderById } from '../data/catalog';
import { buildPairConfig, buildSourcesMap } from '../components/diagramBuilders';
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

export default function PairView() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Pair not found</Text>
        <Text color="subtle">No pair id was provided.</Text>
      </div>
    );
  }

  const pair = getPairById(id);

  if (!pair) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Pair not found</Text>
        <Text color="subtle">No pair exists with id "{id}".</Text>
        <div style={{ marginTop: token('spacing.lg') }}>
          <Link to="/" style={titleLinkStyle}>
            <Text variant="body-sm-semibold" color="accent">← Back to catalog</Text>
          </Link>
        </div>
      </div>
    );
  }

  const agent = getAgentById(pair.agentId);
  const provider = getProviderById(pair.providerId);

  if (!agent || !provider) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Pair not found</Text>
        <Text color="subtle">The agent or provider for this pair could not be loaded.</Text>
      </div>
    );
  }

  const config = buildPairConfig(agent, provider);
  const sourcesMap = buildSourcesMap(agent.sources, provider.sources);
  const allSources = [...agent.sources, ...provider.sources];
  const pairTitle = `${agent.name} + ${provider.name}`;

  return (
    <div style={pageStyle}>
      <div style={sectionStyle}>
        <Text as="h1" variant="heading-xl">{pairTitle}</Text>
        <Text color="subtle">Agent + Provider pair with combined tiering tips.</Text>
      </div>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Architecture</Text>
        </div>
        <Card>
          <Card.Content>
            <div style={{ marginBottom: token('spacing.md') }}>
              <Text variant="body-sm-normal" color="subtle">
                Agent:{' '}
                <Link to={`/agent/${agent.id}`} style={titleLinkStyle}>
                  <Text as="span" variant="body-sm-semibold" color="accent">{agent.name}</Text>
                </Link>
                {'  ·  '}
                Provider:{' '}
                <Link to={`/provider/${provider.id}`} style={titleLinkStyle}>
                  <Text as="span" variant="body-sm-semibold" color="accent">{provider.name}</Text>
                </Link>
              </Text>
            </div>
            <ArchitectureDiagram config={config} sources={sourcesMap} />
          </Card.Content>
        </Card>
      </section>

      {pair.tipNotes.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <Text as="h2" variant="heading-md">Pair Tips</Text>
          </div>
          {pair.tipNotes.map((note, i) => (
            <Alert
              key={i}
              appearance="info"
              layout="section"
              title={`Tip ${i + 1}`}
            >
              <Text variant="body-sm-normal">{note}</Text>
            </Alert>
          ))}
        </section>
      )}

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Sources</Text>
        </div>
        <div style={sourceGridStyle}>
          {allSources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Tiering Matrix</Text>
        </div>
        <TieringTable sources={allSources} />
      </section>
    </div>
  );
}