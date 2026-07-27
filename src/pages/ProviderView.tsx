import { useParams, Link } from 'react-router-dom';
import { Card, Text } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { getProviderById, getAgentById, getPairsForProvider } from '../data/catalog';
import { buildProviderConfig, buildSourcesMap } from '../components/diagramBuilders';
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

const pairListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: token('spacing.sm'),
};

const pairLinkStyle: CSSProperties = {
  textDecoration: 'none',
  color: 'inherit',
};

export default function ProviderView() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Provider not found</Text>
        <Text color="subtle">No provider id was provided.</Text>
      </div>
    );
  }

  const provider = getProviderById(id);

  if (!provider) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Provider not found</Text>
        <Text color="subtle">No provider exists with id "{id}".</Text>
        <div style={{ marginTop: token('spacing.lg') }}>
          <Link to="/" style={titleLinkStyle}>
            <Text variant="body-sm-semibold" color="accent">← Back to catalog</Text>
          </Link>
        </div>
      </div>
    );
  }

  const config = buildProviderConfig(provider);
  const sourcesMap = buildSourcesMap(provider.sources);
  const pairs = getPairsForProvider(id);

  return (
    <div style={pageStyle}>
      <section style={sectionStyle}>
        <Text as="h1" variant="heading-xl">{provider.name}</Text>
        <Text color="subtle">{provider.description}</Text>
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
          {provider.sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Tiering Matrix</Text>
        </div>
        <TieringTable sources={provider.sources} />
      </section>

      {pairs.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeadingStyle}>
            <Text as="h2" variant="heading-md">Paired with</Text>
          </div>
          <div style={pairListStyle}>
            {pairs.map((pair) => {
              const agent = getAgentById(pair.agentId);
              const pairTitle = `${agent?.name ?? pair.agentId} + ${provider.name}`;
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