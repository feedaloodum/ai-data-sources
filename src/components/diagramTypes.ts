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

export interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: DiagramNodeType;
  clickable: boolean;
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
  x: number;
  y: number;
  width: number;
  height: number;
  colorToken?: string;
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

export interface ComputedLayer extends DiagramLayer {}

export interface ComputedLayout {
  nodes: ComputedNode[];
  edges: ComputedEdge[];
  layers: ComputedLayer[];
}