import type { Tier, TierId } from '../types';

export const TIERS: Record<TierId, Tier> = {
  'lakehouse-engine': {
    id: 'lakehouse-engine',
    name: 'Lakehouse Engine',
    verb: 'Investigate it',
    description: 'Session digests, structured event data, accelerated schema-aware search',
    destination: 'Cribl Lakehouse Engine',
  },
  'metrics-store': {
    id: 'metrics-store',
    name: 'Metrics Store',
    verb: 'Monitor it',
    description: 'Token counts, cost, latency, invocation counts, threshold alerts, trend dashboards',
    destination: 'Cribl Metrics Store',
  },
  'cribl-lake': {
    id: 'cribl-lake',
    name: 'Cribl Lake',
    verb: 'Prove it',
    description: 'Full-fidelity masked events, forensic timeline, audit compliance',
    destination: 'Cribl Lake',
  },
  archive: {
    id: 'archive',
    name: 'Archive',
    verb: 'Keep it',
    description: 'Long-term compliance retention, restore-only',
    destination: 'S3 Glacier / Archive',
  },
};

export const TIER_ORDER: TierId[] = [
  'lakehouse-engine',
  'metrics-store',
  'cribl-lake',
  'archive',
];