// ── DiagramConfig Builders ──────────────────────────────────────────────────
// Helper functions that construct node/edge/layer arrays for each view type.
// Layouts use the ArchitectureDiagram's viewBox of 900x680.

import type {
  DiagramConfig,
  DiagramNode,
  DiagramEdge,
  DiagramLayer,
} from './diagramTypes';
import type { Agent, Provider, Gateway, Source } from '../types';
import { TIERS, TIER_ORDER } from '../data/tiering';

// ── Coordinate constants (viewBox 900x680) ─────────────────────────────────

const VIEW_W = 900;

const AGENT_X = 110;
const PROVIDER_X = 790;
const GENERIC_LEFT_X = 110;
const GENERIC_RIGHT_X = 790;
const GATEWAY_CENTER_X = 450;

const NODE_W = 150;
const NODE_H = 56;
const SOURCE_W = 130;
const SOURCE_H = 40;
const TIER_W = 150;
const TIER_H = 40;
const TIER_Y = 600;
const TIER_SPACING = 170;

const EDGE_Y = 70;
const SOURCE_Y = 180;
const MID_Y = 320;
const STREAM_Y = 420;

// ── Shared node builders ─────────────────────────────────────────────────────

function agentNode(agent: Agent, x: number = AGENT_X): DiagramNode {
  return {
    id: `agent-${agent.id}`,
    label: agent.name,
    x,
    y: EDGE_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'agent',
    clickable: true,
  };
}

function providerNode(provider: Provider, x: number = PROVIDER_X): DiagramNode {
  return {
    id: `provider-${provider.id}`,
    label: provider.name,
    x,
    y: EDGE_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'provider',
    clickable: true,
  };
}

function gatewayNode(gateway: Gateway): DiagramNode {
  return {
    id: `gateway-${gateway.id}`,
    label: gateway.name,
    x: GATEWAY_CENTER_X,
    y: EDGE_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'gateway',
    clickable: true,
  };
}

function genericNode(
  id: string,
  label: string,
  x: number,
): DiagramNode {
  return {
    id,
    label,
    x,
    y: EDGE_Y,
    width: NODE_W,
    height: NODE_H,
    type: 'generic',
    clickable: false,
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
  };
}

function edgeNode(id: string, label: string, x: number, y: number): DiagramNode {
  return {
    id,
    label,
    x,
    y,
    width: SOURCE_W,
    height: SOURCE_H,
    type: 'edge',
    clickable: false,
  };
}

function streamNode(id: string, label: string, x: number, y: number): DiagramNode {
  return {
    id,
    label,
    x,
    y,
    width: SOURCE_W,
    height: SOURCE_H,
    type: 'stream',
    clickable: false,
  };
}

function tierNodes(): DiagramNode[] {
  const startX = (VIEW_W - (TIER_W * 4 + TIER_SPACING * 3)) / 2 + TIER_W / 2;
  return TIER_ORDER.map((tierId, i) => {
    const tier = TIERS[tierId];
    return {
      id: `tier-${tierId}`,
      label: tier.name,
      x: startX + i * TIER_SPACING,
      y: TIER_Y,
      width: TIER_W,
      height: TIER_H,
      type: 'tier' as const,
      clickable: false,
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

// ── Layer backgrounds ─────────────────────────────────────────────────────

function topLayer(): DiagramLayer {
  return {
    id: 'topology-layer',
    label: 'Topology',
    x: 20,
    y: 30,
    width: VIEW_W - 40,
    height: 220,
  };
}

function collectionLayer(): DiagramLayer {
  return {
    id: 'collection-layer',
    label: 'Cribl Collection',
    x: 20,
    y: 270,
    width: VIEW_W - 40,
    height: 180,
  };
}

function tierLayer(): DiagramLayer {
  return {
    id: 'tier-layer',
    label: 'Destinations',
    x: 20,
    y: 560,
    width: VIEW_W - 40,
    height: 100,
  };
}

// ── Source positioning helpers ─────────────────────────────────────────────

/**
 * Lay out a list of sources in a vertical column at the given x coordinate.
 * Returns positioned nodes plus an array of source ids (in order).
 */
function sourceColumn(
  sources: Source[],
  x: number,
  startY: number = SOURCE_Y,
  spacing: number = 50,
): { nodes: DiagramNode[]; ids: string[] } {
  const nodes: DiagramNode[] = [];
  const ids: string[] = [];
  sources.forEach((source, i) => {
    nodes.push(sourceNode(source, x, startY + i * spacing));
    ids.push(source.id);
  });
  return { nodes, ids };
}

// ── Pair View Config ───────────────────────────────────────────────────────

export function buildPairConfig(
  agent: Agent,
  provider: Provider,
): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  // Agent (left) + Provider (right)
  const aNode = agentNode(agent);
  const pNode = providerNode(provider);
  nodes.push(aNode, pNode);

  // API call between agent and provider
  edges.push({
    id: `${aNode.id}-${pNode.id}`,
    from: aNode.id,
    to: pNode.id,
    type: 'api-call',
    label: 'API',
  });

  // Agent sources (left column, below agent)
  const agentSourcesCol = sourceColumn(agent.sources, AGENT_X, SOURCE_Y);
  nodes.push(...agentSourcesCol.nodes);

  // Provider sources (right column, below provider)
  const providerSourcesCol = sourceColumn(provider.sources, PROVIDER_X, SOURCE_Y);
  nodes.push(...providerSourcesCol.nodes);

  // Cribl Edge (middle-left) — only for agents
  const edgeNode_ = edgeNode('cribl-edge', 'Cribl Edge', 300, MID_Y);
  nodes.push(edgeNode_);

  // Cribl Stream (middle-right)
  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', 600, MID_Y);
  nodes.push(streamNode_);

  // Agent sources → Cribl Edge
  for (const sid of agentSourcesCol.ids) {
    edges.push({
      id: `${sid}-edge`,
      from: sid,
      to: edgeNode_.id,
      type: 'data-flow',
    });
  }
  // Provider sources → Cribl Stream
  for (const sid of providerSourcesCol.ids) {
    edges.push({
      id: `${sid}-stream`,
      from: sid,
      to: streamNode_.id,
      type: 'data-flow',
    });
  }
  // Cribl Edge → Cribl Stream
  edges.push({
    id: `${edgeNode_.id}-${streamNode_.id}`,
    from: edgeNode_.id,
    to: streamNode_.id,
    type: 'data-flow',
  });

  // Tier nodes (bottom row) — fed from Cribl Stream
  nodes.push(...tierNodes());
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [topLayer(), collectionLayer(), tierLayer()];

  return { viewType: 'pair', nodes, edges, layers };
}

// ── Agent View Config ───────────────────────────────────────────────────────

export function buildAgentConfig(agent: Agent): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

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

  // Agent sources (left column, below agent)
  const agentSourcesCol = sourceColumn(agent.sources, AGENT_X, SOURCE_Y);
  nodes.push(...agentSourcesCol.nodes);

  // Cribl Edge (middle-left) — only for agents
  const edgeNode_ = edgeNode('cribl-edge', 'Cribl Edge', 300, MID_Y);
  nodes.push(edgeNode_);

  // Cribl Stream (middle-right)
  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', 600, MID_Y);
  nodes.push(streamNode_);

  // Agent sources → Cribl Edge
  for (const sid of agentSourcesCol.ids) {
    edges.push({
      id: `${sid}-edge`,
      from: sid,
      to: edgeNode_.id,
      type: 'data-flow',
    });
  }
  // Cribl Edge → Cribl Stream
  edges.push({
    id: `${edgeNode_.id}-${streamNode_.id}`,
    from: edgeNode_.id,
    to: streamNode_.id,
    type: 'data-flow',
  });

  // Tier nodes fed from Cribl Stream
  nodes.push(...tierNodes());
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [topLayer(), collectionLayer(), tierLayer()];

  return { viewType: 'agent', nodes, edges, layers };
}

// ── Provider View Config ────────────────────────────────────────────────────

export function buildProviderConfig(provider: Provider): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

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

  // Provider sources (right column, below provider)
  const providerSourcesCol = sourceColumn(provider.sources, PROVIDER_X, SOURCE_Y);
  nodes.push(...providerSourcesCol.nodes);

  // NO Cribl Edge node for providers — straight to Cribl Stream
  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', 450, MID_Y);
  nodes.push(streamNode_);

  // Provider sources → Cribl Stream
  for (const sid of providerSourcesCol.ids) {
    edges.push({
      id: `${sid}-stream`,
      from: sid,
      to: streamNode_.id,
      type: 'data-flow',
    });
  }

  // Tier nodes fed from Cribl Stream
  nodes.push(...tierNodes());
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [topLayer(), collectionLayer(), tierLayer()];

  return { viewType: 'provider', nodes, edges, layers };
}

// ── Gateway View Config ─────────────────────────────────────────────────────

export function buildGatewayConfig(gateway: Gateway): DiagramConfig {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const genericAgent = genericNode('generic-agent', 'AI Agent', GENERIC_LEFT_X);
  const gNode = gatewayNode(gateway);
  const genericProvider = genericNode('generic-provider', 'AI Provider', GENERIC_RIGHT_X);
  nodes.push(genericAgent, gNode, genericProvider);

  // Agent → Gateway → Provider
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

  // Gateway sources (center column, below gateway)
  const gatewaySourcesCol = sourceColumn(gateway.sources, GATEWAY_CENTER_X, SOURCE_Y);
  nodes.push(...gatewaySourcesCol.nodes);

  // NO Cribl Edge node for gateways — straight to Cribl Stream
  const streamNode_ = streamNode('cribl-stream', 'Cribl Stream', 450, STREAM_Y);
  nodes.push(streamNode_);

  // Gateway sources → Cribl Stream
  for (const sid of gatewaySourcesCol.ids) {
    edges.push({
      id: `${sid}-stream`,
      from: sid,
      to: streamNode_.id,
      type: 'data-flow',
    });
  }

  // Tier nodes fed from Cribl Stream
  nodes.push(...tierNodes());
  edges.push(...tierEdges(streamNode_.id));

  const layers: DiagramLayer[] = [topLayer(), collectionLayer(), tierLayer()];

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