import { useParams, Link } from 'react-router-dom';
import { Card, Text } from '@capra/core';
import { token } from '@capra/theme';
import type { CSSProperties } from 'react';
import { getGatewayById } from '../data/catalog';
import { buildGatewayConfig, buildSourcesMap } from '../components/diagramBuilders';
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

export default function GatewayView() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Gateway not found</Text>
        <Text color="subtle">No gateway id was provided.</Text>
      </div>
    );
  }

  const gateway = getGatewayById(id);

  if (!gateway) {
    return (
      <div style={pageStyle}>
        <Text as="h1" variant="heading-lg">Gateway not found</Text>
        <Text color="subtle">No gateway exists with id "{id}".</Text>
        <div style={{ marginTop: token('spacing.lg') }}>
          <Link to="/" style={titleLinkStyle}>
            <Text variant="body-sm-semibold" color="accent">← Back to catalog</Text>
          </Link>
        </div>
      </div>
    );
  }

  const config = buildGatewayConfig(gateway);
  const sourcesMap = buildSourcesMap(gateway.sources);

  return (
    <div style={pageStyle}>
      <section style={sectionStyle}>
        <Text as="h1" variant="heading-xl">{gateway.name}</Text>
        <Text color="subtle">{gateway.description}</Text>
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
          {gateway.sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeadingStyle}>
          <Text as="h2" variant="heading-md">Tiering Matrix</Text>
        </div>
        <TieringTable sources={gateway.sources} />
      </section>
    </div>
  );
}