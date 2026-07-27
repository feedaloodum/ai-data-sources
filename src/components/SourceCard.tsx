import { useState } from 'react';
import { Card, Text, Pill } from '@capra/core';
import type { Source } from '../types';
import { TIERS, TIER_ORDER } from '../data/tiering';
import { EventModal } from './EventModal';
import './SourceCard.css';

interface SourceCardProps {
  source: Source;
  onExpand?: (source: Source) => void;
}

const COLLECTION_METHOD_LABELS: Record<string, string> = {
  'edge-file-tail': 'File Tail',
  'edge-otel-receiver': 'OTel Receiver',
  'stream-s3': 'S3',
  'stream-http': 'HTTP',
  'stream-api-poll': 'API Poll',
  'stream-syslog': 'Syslog',
  'stream-prometheus-scrape': 'Prometheus Scrape',
  'stream-database': 'Database',
};

const TIER_PILL_APPEARANCE: Record<string, 'info' | 'success' | 'warning' | 'highlight' | 'default'> = {
  'lakehouse-engine': 'info',
  'metrics-store': 'success',
  'cribl-lake': 'highlight',
  archive: 'default',
};

export function SourceCard({ source, onExpand }: SourceCardProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = onExpand !== undefined;

  const handleOpen = () => {
    if (isControlled) {
      onExpand(source);
    } else {
      setInternalOpen(true);
    }
  };

  // Build a deduped, ordered list of tier ids the source lands in.
  const tierIds = TIER_ORDER.filter((id) =>
    source.tieringSuggestions.some((s) => s.tierId === id),
  );

  return (
    <>
      <div className="source-card" onClick={handleOpen}>
      <Card>
        <Card.Header>
          <Card.Title>{source.name}</Card.Title>
          <Card.Action>
            <div className="source-card__badges">
              <Pill appearance="highlight" variant="muted" inline>
                {source.criblProduct}
              </Pill>
              {source.requiresEnterprise && (
                <Pill appearance="warning" variant="muted" inline>
                  Enterprise
                </Pill>
              )}
            </div>
          </Card.Action>
        </Card.Header>
        <Card.Content>
          <div className="source-card__collection-method">
            <Text variant="body-sm-normal" color="subtle">
              Collection: {COLLECTION_METHOD_LABELS[source.collectionMethod] ?? source.collectionMethod}
            </Text>
          </div>
          <Card.Description>{source.description}</Card.Description>
          {tierIds.length > 0 && (
            <div className="source-card__tier-badges">
              {tierIds.map((tierId) => (
                <Pill
                  key={tierId}
                  appearance={TIER_PILL_APPEARANCE[tierId] ?? 'default'}
                  variant="muted"
                  inline
                >
                  {TIERS[tierId].name}
                </Pill>
              ))}
            </div>
          )}
          {source.limitation && (
            <div className="source-card__limitation">
              <Text variant="body-sm-normal" color="warning">
                ⚠ {source.limitation}
              </Text>
            </div>
          )}
        </Card.Content>
      </Card>
      </div>
      {!isControlled && (
        <EventModal source={internalOpen ? source : null} onClose={() => setInternalOpen(false)} />
      )}
    </>
  );
}