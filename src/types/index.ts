// ── Tiering Model ─────────────────────────────────────────────────────────────

export type TierId = 'lakehouse-engine' | 'metrics-store' | 'cribl-lake' | 'archive';

export interface Tier {
  id: TierId;
  name: string;
  verb: string;
  description: string;
  destination: string;
}

export interface TieringSuggestion {
  tierId: TierId;
  fields: string[];
  reason: string;
}

// ── Sources ───────────────────────────────────────────────────────────────────

export type CollectionMethod =
  | 'edge-file-tail'
  | 'edge-otel-receiver'
  | 'stream-s3'
  | 'stream-http'
  | 'stream-api-poll'
  | 'stream-syslog'
  | 'stream-prometheus-scrape'
  | 'stream-database';

export interface ExampleEventTab {
  label: string;
  language: string;
  content: string;
}

export interface Source {
  id: string;
  name: string;
  description: string;
  collectionMethod: CollectionMethod;
  criblProduct: 'Cribl Edge' | 'Cribl Stream';
  /** What the logs contain — key fields, record types, and data captured. */
  contains?: string[];
  /** Use cases — questions this data answers. */
  useCases?: string[];
  exampleEventTabs: ExampleEventTab[];
  tieringSuggestions: TieringSuggestion[];
  limitation?: string;
  requiresEnterprise?: boolean;
}

// ── Agents ────────────────────────────────────────────────────────────────────

export type AgentStatus = 'v1' | 'coming-soon';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  sources: Source[];
  promotionChecklist?: string[];
}

// ── Providers ─────────────────────────────────────────────────────────────────

export interface Provider {
  id: string;
  name: string;
  description: string;
  sources: Source[];
}

// ── Gateways ──────────────────────────────────────────────────────────────────

export interface Gateway {
  id: string;
  name: string;
  description: string;
  sources: Source[];
}

// ── Pairs ─────────────────────────────────────────────────────────────────────

export interface Pair {
  id: string;
  agentId: string;
  providerId: string;
  tipNotes: string[];
}