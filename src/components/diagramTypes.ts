// ── Diagram Types ─────────────────────────────────────────────────────────────

export type ViewType = 'pair' | 'agent' | 'provider' | 'gateway';

export type DiagramNodeType =
  | 'agent'
  | 'provider'
  | 'gateway'
  | 'source'
  | 'edge'
  | 'stream'
  | 'tier'
  | 'generic';

export type EdgeType = 'data-flow' | 'api-call' | 'audit' | 'return';

export type NodeIcon =
  | 'edge'
  | 'stream'
  | 'lakehouse'
  | 'metrics'
  | 'lake'
  | 'archive';

export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: DiagramNodeType;
  clickable: boolean;
  /** Optional Cribl product / destination icon rendered inside the node. */
  icon?: NodeIcon;
  /** Entity id (agent/provider/gateway) for looking up its brand logo. */
  brandId?: string;
  /** Band this node belongs to; drives computed layer geometry. */
  layerId?: string;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
}

export interface DiagramLayer {
  id: string;
  label: string;
  colorToken?: string;
  /**
   * Explicit geometry is optional. When omitted, computeLayout derives the
   * band's rect from the bounds of all nodes whose `layerId` matches this id,
   * so bands always frame their content instead of relying on fixed heights.
   */
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface DiagramConfig {
  viewType: ViewType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  layers: DiagramLayer[];
}

// ── Computed Layout Output ───────────────────────────────────────────────────

export interface ComputedNode extends DiagramNode {
  // Inherited from DiagramNode — positions are final after layout
}

export interface ComputedEdge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
  path: string; // SVG path string
}

export interface ComputedLayer {
  id: string;
  label: string;
  colorToken?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ComputedLayout {
  nodes: ComputedNode[];
  edges: ComputedEdge[];
  layers: ComputedLayer[];
  viewBox: ViewBox;
}