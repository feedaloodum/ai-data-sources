// ── DiagramConfig Builders ──────────────────────────────────────────────────
// Helper functions that construct node/edge/layer arrays for each view type.
// The diagram's viewBox is auto-fit to content (see computeViewBox), and layer
// bands are sized to their member nodes (see computeLayers), so coordinates
// here only need to be internally consistent — not bounded to a fixed canvas.

import type {
  DiagramConfig,
  DiagramNode,
  DiagramEdge,
  DiagramLayer,
} from './diagramTypes';
import type { Agent, Provider, Gateway, Source } from '../types';
import { TIERS, TIER_ORDER } from '../data/tiering';

// ── Layer ids ───────────────────────────────────────────────────────────────

const L_TOPOLOGY = 'topology';
const L_SOURCES = 'sources';
const L_COLLECTION = 'collection';
const L_DESTINATIONS = 'destinations';

// ── Coordinate constants ────────────────────────────────────────────────────

const AGENT_X = 130;
const PROVIDER_X = 830;
const GENERIC_LEFT_X = 130;
const GENERIC_RIGHT_X = 830;
const CENTER_X = 480;
const EDGE_X = 330;
const STREAM_X = 630;

// Boxes are wider/taller than before so labels can wrap to two lines.
const NODE_W = 172;
const NODE_H = 60;
const SOURCE_W = 190;
const SOURCE_H = 54;
const CRIBL_W = 168;
const CRIBL_H = 60;
const TIER_W = 184;
const TIER_H = 56;
const TIER_SPACING = 206;

// Vertical rhythm. Downstream rows are placed relative to the tallest source
// column so bands never overlap regardless of source count.
const TOP_Y = 70;
const SOURCE_START_Y = 200;
const SOURCE_SPACING = 68;
const ROW_GAP = 132;

/** Y centers for the collection + destination rows given the tallest column. */
function rowYs(maxSourceCount: number): { collectionY: number; tierY: number } {
  const lastSourceY = SOURCE_START_Y + Math.max(0, maxSourceCount - 1) * SOURCE_SPACING;
  const collectionY = lastSourceY + ROW_GAP;
  const tierY = collectionY + ROW_GAP;
  return { collectionY, tierY };
}

// ── Shared node builders ─────────────────────────────────────────────────────

function agentNode(agent: Agent, x: number = AGENT_X): DiagramNode {
  return {
    id: `agent-${agent.id}`,
    label: agent.name,
    x,
    y: TOP_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'agent',
    clickable: true,
    brandId: agent.id,
    layerId: L_TOPOLOGY,
  };
}

function providerNode(provider: Provider, x: number = PROVIDER_X): DiagramNode {
  return {
    id: `provider-${provider.id}`,
    label: provider.name,
    x,
    y: TOP_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'provider',
    clickable: true,
    brandId: provider.id,
    layerId: L_TOPOLOGY,
  };
}

function gatewayNode(gateway: Gateway): DiagramNode {
  return {
    id: `gateway-${gateway.id}`,
    label: gateway.name,
    x: CENTER_X,
    y: TOP_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'gateway',
    clickable: true,
    brandId: gateway.id,
    layerId: L_TOPOLOGY,
  };
}

function genericNode(id: string, label: string, x: number): DiagramNode {
  return {
    id,
    label,
    x,
    y: TOP_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'generic',
    clickable: false,
    layerId: L_TOPOLOGY,
  };
}

function sourceNode(source: Source, x: number, y: number): DiagramNode {
  return {
    id: source.id,
    label: source.name,
    x,
    y,
    width: SOURCE_W,
    height: SOURCE_H,
    type: 'source',
    clickable: true,
    layerId: L_SOURCES,
  };
}

function edgeNode(id: string, label: string, x: number, y: number): DiagramNode {
  return {
    id,
    label,
    x,
    y,
    width: CRIBL_W,
    height: CRIBL_H,
    type: 'edge',
    clickable: false,
    icon: 'edge',
    layerId: L_COLLECTION,
  };
}

function streamNode(id: string, label: string, x: number, y: number): DiagramNode {
  return {
    id,
    label,
    x,
    y,
    width: CRIBL_W,
    height: CRIBL_H,
    type: 'stream',
    clickable: false,
    icon: 'stream',
    layerId: L_COLLECTION,
  };
}

const TIER_ICON = {
  'lakehouse-engine': 'lakehouse',
  'metrics-store': 'metrics',
  'cribl-lake': 'lake',
  archive: 'archive',
} as const;

function tierNodes(tierY: number): DiagramNode[] {
  const startX = CENTER_X - (TIER_SPACING * (TIER_ORDER.length - 1)) / 2;
  return TIER_ORDER.map((tierId, i) => {
    const tier = TIERS[tierId];
    return {
      id: `tier-${tierId}`,
      label: tier.name,
      x: startX + i * TIER_SPACING,
      y: tierY,
      width: TIER_W,
      height: TIER_H,
      type: 'tier' as const,
      clickable: false,
      icon: TIER_ICON[tierId],
      layerId: L_DESTINATIONS,
    };
  });
}

function tierEdges(upstreamNodeId: string): DiagramEdge[] {
  return TIER_ORDER.map((tierId) => ({
    id: `${upstreamNodeId}-tier-${tierId}`,
    from: upstreamNodeId,
    to: `tier-${tierId}`,
    type: 'data-flow' as const,
  }));
}

// ── Layer backgrounds (geometry computed from member nodes) ──────────────────

function labelLayer(id: string, label: string): DiagramLayer {
  return { id, label };
}

// ── Source positioning helper ───────────────────────────────────────────────

/** Lay sources in a vertical column at x. Returns positioned nodes + ids. */
function sourceColumn(
  sources: Source[],
  x: number,
): { nodes: DiagramNode[]; ids: string[] } {
  const nodes: DiagramNode[] = [];
  const ids: string[] = [];
  sources.forEach((source, i) => {
    nodes.push(sourceNode(source, x, SOURCE_START_Y + i * SOURCE_SPACING));
    ids.push(source.id);
  });
  return { nodes, ids };
}

// ── Pair View Config ───────────────────────────────────────────────────────

export function buildPairConfig(agent: Agent, provider: Provider): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const { collectionY, tierY } = rowYs(
    Math.max(agent.sources.length, provider.sources.length),
  );

  const aNode = agentNode(agent);
  const pNode = providerNode(provider);
  nodes.push(aNode, pNode);

  edges.push({
    id: `${aNode.id}-${pNode.id}`,
    from: aNode.id,
    to: pNode.id,
    type: 'api-call',
    label: 'API',
  });

  const agentSourcesCol = sourceColumn(agent.sources, AGENT_X);
  nodes.push(...agentSourcesCol.nodes);

  const providerSourcesCol = sourceColumn(provider.sources, PROVIDER_X);
  nodes.push(...providerSourcesCol.nodes);

  const edgeNode_ = edgeNode('cribl-edge', 'Cribl Edge', EDGE_X, collectionY);
  nodes.push(edgeNode_);

  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', STREAM_X, collectionY);
  nodes.push(streamNode_);

  for (const sid of agentSourcesCol.ids) {
    edges.push({ id: `${sid}-edge`, from: sid, to: edgeNode_.id, type: 'data-flow' });
  }
  for (const sid of providerSourcesCol.ids) {
    edges.push({ id: `${sid}-stream`, from: sid, to: streamNode_.id, type: 'data-flow' });
  }
  edges.push({
    id: `${edgeNode_.id}-${streamNode_.id}`,
    from: edgeNode_.id,
    to: streamNode_.id,
    type: 'data-flow',
  });

  nodes.push(...tierNodes(tierY));
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [
    labelLayer(L_TOPOLOGY, 'Topology'),
    labelLayer(L_SOURCES, 'Data Sources'),
    labelLayer(L_COLLECTION, 'Cribl Collection'),
    labelLayer(L_DESTINATIONS, 'Destinations'),
  ];

  return { viewType: 'pair', nodes, edges, layers };
}

// ── Agent View Config ───────────────────────────────────────────────────────

export function buildAgentConfig(agent: Agent): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const { collectionY, tierY } = rowYs(agent.sources.length);

  const aNode = agentNode(agent);
  const genericProvider = genericNode('generic-provider', 'AI Provider', GENERIC_RIGHT_X);
  nodes.push(aNode, genericProvider);

  edges.push({
    id: `${aNode.id}-${genericProvider.id}`,
    from: aNode.id,
    to: genericProvider.id,
    type: 'api-call',
    label: 'API',
  });

  const agentSourcesCol = sourceColumn(agent.sources, AGENT_X);
  nodes.push(...agentSourcesCol.nodes);

  const edgeNode_ = edgeNode('cribl-edge', 'Cribl Edge', EDGE_X, collectionY);
  nodes.push(edgeNode_);

  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', STREAM_X, collectionY);
  nodes.push(streamNode_);

  for (const sid of agentSourcesCol.ids) {
    edges.push({ id: `${sid}-edge`, from: sid, to: edgeNode_.id, type: 'data-flow' });
  }
  edges.push({
    id: `${edgeNode_.id}-${streamNode_.id}`,
    from: edgeNode_.id,
    to: streamNode_.id,
    type: 'data-flow',
  });

  nodes.push(...tierNodes(tierY));
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [
    labelLayer(L_TOPOLOGY, 'Topology'),
    labelLayer(L_SOURCES, 'Data Sources'),
    labelLayer(L_COLLECTION, 'Cribl Collection'),
    labelLayer(L_DESTINATIONS, 'Destinations'),
  ];

  return { viewType: 'agent', nodes, edges, layers };
}

// ── Provider View Config ────────────────────────────────────────────────────

export function buildProviderConfig(provider: Provider): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const { collectionY, tierY } = rowYs(provider.sources.length);

  const genericAgent = genericNode('generic-agent', 'AI Agent', GENERIC_LEFT_X);
  const pNode = providerNode(provider);
  nodes.push(genericAgent, pNode);

  edges.push({
    id: `${genericAgent.id}-${pNode.id}`,
    from: genericAgent.id,
    to: pNode.id,
    type: 'api-call',
    label: 'API',
  });

  const providerSourcesCol = sourceColumn(provider.sources, PROVIDER_X);
  nodes.push(...providerSourcesCol.nodes);

  // No Cribl Edge for providers — straight to Cribl Stream (centered).
  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', CENTER_X, collectionY);
  nodes.push(streamNode_);

  for (const sid of providerSourcesCol.ids) {
    edges.push({ id: `${sid}-stream`, from: sid, to: streamNode_.id, type: 'data-flow' });
  }

  nodes.push(...tierNodes(tierY));
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [
    labelLayer(L_TOPOLOGY, 'Topology'),
    labelLayer(L_SOURCES, 'Data Sources'),
    labelLayer(L_COLLECTION, 'Cribl Collection'),
    labelLayer(L_DESTINATIONS, 'Destinations'),
  ];

  return { viewType: 'provider', nodes, edges, layers };
}

// ── Gateway View Config ─────────────────────────────────────────────────────

export function buildGatewayConfig(gateway: Gateway): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const { collectionY, tierY } = rowYs(gateway.sources.length);

  const genericAgent = genericNode('generic-agent', 'AI Agent', GENERIC_LEFT_X);
  const gNode = gatewayNode(gateway);
  const genericProvider = genericNode('generic-provider', 'AI Provider', GENERIC_RIGHT_X);
  nodes.push(genericAgent, gNode, genericProvider);

  edges.push({
    id: `${genericAgent.id}-${gNode.id}`,
    from: genericAgent.id,
    to: gNode.id,
    type: 'api-call',
    label: 'API',
  });
  edges.push({
    id: `${gNode.id}-${genericProvider.id}`,
    from: gNode.id,
    to: genericProvider.id,
    type: 'api-call',
    label: 'API',
  });

  const gatewaySourcesCol = sourceColumn(gateway.sources, CENTER_X);
  nodes.push(...gatewaySourcesCol.nodes);

  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', CENTER_X, collectionY);
  nodes.push(streamNode_);

  for (const sid of gatewaySourcesCol.ids) {
    edges.push({ id: `${sid}-stream`, from: sid, to: streamNode_.id, type: 'data-flow' });
  }

  nodes.push(...tierNodes(tierY));
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [
    labelLayer(L_TOPOLOGY, 'Topology'),
    labelLayer(L_SOURCES, 'Data Sources'),
    labelLayer(L_COLLECTION, 'Cribl Collection'),
    labelLayer(L_DESTINATIONS, 'Destinations'),
  ];

  return { viewType: 'gateway', nodes, edges, layers };
}

// ── Sources map builder ──────────────────────────────────────────────────────

export function buildSourcesMap(...sourceLists: Source[][]): Record<string, Source> {
  const map: Record<string, Source> = {};
  for (const list of sourceLists) {
    for (const source of list) {
      map[source.id] = source;
    }
  }
  return map;
}
