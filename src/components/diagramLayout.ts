import type {
  DiagramNode,
  DiagramConfig,
  ComputedLayout,
  ComputedNode,
  ComputedEdge,
  ComputedLayer,
  EdgeType,
} from './diagramTypes';

// ── Path Computation ────────────────────────────────────────────────────────

export function computePath(from: DiagramNode, to: DiagramNode, type: EdgeType): string {
  const x1 = from.x;
  const y1 = from.y;
  const x2 = to.x;
  const y2 = to.y;
  const h1 = from.height / 2;
  const h2 = to.height / 2;

  // Return/audit edges use curved paths
  if (type === 'return') {
    const curveY = Math.min(y1, y2) - 80;
    return `M ${x1} ${y1 - h1} C ${x1} ${curveY}, ${x2} ${curveY}, ${x2} ${y2 - h2}`;
  }

  // Vertically aligned → straight vertical line
  if (Math.abs(x1 - x2) < 5) {
    return `M ${x1} ${y1 + h1} L ${x2} ${y2 - h2}`;
  }

  // Horizontally aligned → straight horizontal line
  if (Math.abs(y1 - y2) < 5) {
    const w1 = from.width / 2;
    const w2 = to.width / 2;
    return `M ${x1 + w1} ${y1} L ${x2 - w2} ${y2}`;
  }

  // Diagonal → orthogonal (L-shaped) path
  const midY = (y1 + h1 + y2 - h2) / 2;
  return `M ${x1} ${y1 + h1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2 - h2}`;
}

// ── Layout Computation ───────────────────────────────────────────────────────

export function computeLayout(config: DiagramConfig): ComputedLayout {
  // Nodes pass through with their positions (already set in config)
  const nodes: ComputedNode[] = config.nodes.map((n) => ({ ...n }));

  // Compute edge paths
  const nodeMap = new Map<string, DiagramNode>();
  for (const n of config.nodes) {
    nodeMap.set(n.id, n);
  }

  const edges: ComputedEdge[] = config.edges.map((e) => {
    const fromNode = nodeMap.get(e.from);
    const toNode = nodeMap.get(e.to);
    if (!fromNode || !toNode) {
      return {
        id: `${e.from}-${e.to}`,
        from: e.from,
        to: e.to,
        type: e.type,
        label: e.label,
        path: '',
      };
    }
    return {
      id: `${e.from}-${e.to}`,
      from: e.from,
      to: e.to,
      type: e.type,
      label: e.label,
      path: computePath(fromNode, toNode, e.type),
    };
  });

  // Layers pass through
  const layers: ComputedLayer[] = config.layers.map((l) => ({ ...l }));

  return { nodes, edges, layers };
}