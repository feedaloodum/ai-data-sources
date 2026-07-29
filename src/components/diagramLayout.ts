import type {
  DiagramNode,
  DiagramConfig,
  ComputedLayout,
  ComputedNode,
  ComputedEdge,
  ComputedLayer,
  EdgeType,
  ViewBox,
} from './diagramTypes';

// Padding around the tightest content bounds so strokes, arrowheads, and
// edge labels are not clipped at the viewBox border.
const VIEWBOX_PADDING = 24;

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

  const layers = computeLayers(config.layers, config.nodes);

  const viewBox = computeViewBox(config, layers, nodeMap);

  return { nodes, edges, layers, viewBox };
}

// ── Layer Computation ────────────────────────────────────────────────────────

// Padding between a band's edge and the nodes it frames.
const LAYER_PADDING_X = 20;
const LAYER_PADDING_TOP = 28; // extra room for the band label
const LAYER_PADDING_BOTTOM = 16;

/**
 * Resolve each layer's rect. If explicit geometry is provided it passes
 * through; otherwise the band is sized to enclose every node whose `layerId`
 * matches, so tall/variable content (e.g. long source columns) never spills
 * past its band into a neighbor.
 */
function computeLayers(layers: DiagramConfig['layers'], nodes: DiagramNode[]): ComputedLayer[] {
  return layers.map((l) => {
    if (l.x != null && l.y != null && l.width != null && l.height != null) {
      return { ...l, x: l.x, y: l.y, width: l.width, height: l.height };
    }

    const members = nodes.filter((n) => n.layerId === l.id);
    if (members.length === 0) {
      return { ...l, x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of members) {
      minX = Math.min(minX, n.x - n.width / 2);
      minY = Math.min(minY, n.y - n.height / 2);
      maxX = Math.max(maxX, n.x + n.width / 2);
      maxY = Math.max(maxY, n.y + n.height / 2);
    }

    return {
      ...l,
      x: minX - LAYER_PADDING_X,
      y: minY - LAYER_PADDING_TOP,
      width: maxX - minX + LAYER_PADDING_X * 2,
      height: maxY - minY + LAYER_PADDING_TOP + LAYER_PADDING_BOTTOM,
    };
  });
}

// ── ViewBox Computation ──────────────────────────────────────────────────────

/**
 * Compute the tightest bounding box around all content, then pad it. Nodes are
 * centered on (x, y); layers are top-left anchored. `return` edges bow 80px
 * above the higher of their two endpoints, so those peaks extend the box too.
 */
function computeViewBox(
  config: DiagramConfig,
  layers: ComputedLayer[],
  nodeMap: Map<string, DiagramNode>,
): ViewBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of config.nodes) {
    minX = Math.min(minX, n.x - n.width / 2);
    minY = Math.min(minY, n.y - n.height / 2);
    maxX = Math.max(maxX, n.x + n.width / 2);
    maxY = Math.max(maxY, n.y + n.height / 2);
  }

  for (const l of layers) {
    minX = Math.min(minX, l.x);
    minY = Math.min(minY, l.y);
    maxX = Math.max(maxX, l.x + l.width);
    maxY = Math.max(maxY, l.y + l.height);
  }

  // `return` edges bow 80px above the higher endpoint (see computePath).
  for (const e of config.edges) {
    if (e.type !== 'return') continue;
    const from = nodeMap.get(e.from);
    const to = nodeMap.get(e.to);
    if (!from || !to) continue;
    minY = Math.min(minY, from.y - from.height / 2, to.y - to.height / 2, Math.min(from.y, to.y) - 80);
  }

  // Empty diagram fallback.
  if (!Number.isFinite(minX)) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  return {
    x: minX - VIEWBOX_PADDING,
    y: minY - VIEWBOX_PADDING,
    width: maxX - minX + VIEWBOX_PADDING * 2,
    height: maxY - minY + VIEWBOX_PADDING * 2,
  };
}